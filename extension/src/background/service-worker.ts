/**
 * TabMind — Background Service Worker (Manifest V3)
 *
 * Handles the full tab lifecycle:
 *  - Create → inject overlay, POST to backend
 *  - Updated (load complete) → sync title/favicon
 *  - Removed → mark abandoned, PATCH backend
 *  - Focus changed → track active time
 *  - Messages from overlay — persist intent or request AI suggestion
 *  - Periodic alarm — retry any tabs that failed to POST
 */

import api from '../utils/api';
import {
  getTab,
  setTab,
  getAllTabs,
  removeTab,
  setToken,
} from '../utils/storage';
import type { Tab, TabStatus } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the domain from a full URL. Returns '' on failure. */
const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};



// ─── Focus tracking state ──────────────────────────────────────────────────────
// Service workers persist state in-memory between events within the same session.
let activeTabId: number | null = null;
let focusStart: number | null = null;

// ─── 1. TAB CREATED ───────────────────────────────────────────────────────────

chrome.tabs.onCreated.addListener(async (chromeTab) => {
  try {
    if (!chromeTab.id) return;
    // Skip non-http pages (new-tab page, chrome://, etc.)
    const url = chromeTab.url || chromeTab.pendingUrl || '';
    if (!url.startsWith('http')) return;

    const tabRecord: Tab = {
      tabId: chromeTab.id,
      windowId: chromeTab.windowId,
      url,
      domain: extractDomain(url),
      title: chromeTab.title || '',
      favicon: chromeTab.favIconUrl,
      intent: '',
      status: 'open',
      timing: {
        openedAt: new Date().toISOString(),
      },
    };

    // 1a. Persist to local storage immediately
    await setTab(chromeTab.id, tabRecord);

    // 1b. The intent overlay is injected automatically by CRXJS via the
    //     content_scripts entry in manifest.json on every http/https page.
    //     Dynamic scripting.executeScript is NOT used here because post-build,
    //     CRXJS renames .tsx files and the raw source path would cause an error.

    // 1c. POST to backend asynchronously — non-blocking
    postTabToBackend(tabRecord, chromeTab.id);
  } catch (err) {
    console.warn('[TabMind SW] onCreated error:', err);
  }
});

/** POST a new tab to the backend. Marks the local record with _id on success. */
async function postTabToBackend(tabRecord: Tab, chromeTabId: number) {
  try {
    const response = await api.post<Tab>('/tabs', tabRecord);
    // Save the MongoDB _id onto the local record for future PATCHes
    if (response.data?._id) {
      await setTab(chromeTabId, { ...tabRecord, _id: response.data._id });
    }
  } catch {
    // Mark as "needs sync" by storing without _id — the alarm will retry
  }
}

// ─── 2. TAB UPDATED ───────────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, chromeTab) => {
  try {
    // Only act when the page has fully loaded
    if (changeInfo.status !== 'complete') return;

    const stored = await getTab(tabId);
    if (!stored) return;

    const updates: Partial<Tab> = {};

    if (chromeTab.title) updates.title = chromeTab.title;
    if (chromeTab.favIconUrl) updates.favicon = chromeTab.favIconUrl;
    if (chromeTab.url && chromeTab.url !== stored.url) {
      updates.url = chromeTab.url;
      updates.domain = extractDomain(chromeTab.url);
    }

    if (Object.keys(updates).length === 0) return;

    const updatedRecord = { ...stored, ...updates };
    await setTab(tabId, updatedRecord);

    // Sync to backend if we have a MongoDB _id
    if (stored._id) {
      api.patch(`/tabs/${stored._id}`, updates).catch(() => {});
    }
  } catch (err) {
    console.warn('[TabMind SW] onUpdated error:', err);
  }
});

// ─── 3. TAB REMOVED ───────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId, _removeInfo) => {
  try {
    const stored = await getTab(tabId);
    if (!stored) return;

    // Only auto-abandon if still open (user may have already marked done)
    if (stored.status === 'open') {
      const closedAt = new Date().toISOString();

      if (stored._id) {
        api.patch(`/tabs/${stored._id}`, {
          status: 'abandoned' as TabStatus,
          'timing.closedAt': closedAt,
        }).catch(() => {});
      }
    }

    // Always remove from local cache
    await removeTab(tabId);
  } catch (err) {
    console.warn('[TabMind SW] onRemoved error:', err);
  }
});

// ─── 4. WINDOW FOCUS CHANGED ──────────────────────────────────────────────────

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  try {
    const now = Date.now();

    // Commit active time for the previously-tracked tab
    if (activeTabId !== null && focusStart !== null) {
      const activeMs = now - focusStart;
      const prev = await getTab(activeTabId);
      if (prev) {
        const currentActive = prev.timing.activeSeconds ?? 0;
        const updatedRecord = {
          ...prev,
          timing: {
            ...prev.timing,
            activeSeconds: currentActive + Math.round(activeMs / 1000),
            lastActiveAt: new Date(focusStart).toISOString(),
          },
        };
        await setTab(activeTabId, updatedRecord);

        if (prev._id) {
          api.patch(`/tabs/${prev._id}`, {
            'timing.activeSeconds': updatedRecord.timing.activeSeconds,
            'timing.lastActiveAt': updatedRecord.timing.lastActiveAt,
          }).catch(() => {});
        }
      }
    }

    // Start tracking the newly focused tab
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      activeTabId = null;
      focusStart = null;
      return;
    }

    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]?.id) {
        activeTabId = tabs[0].id;
        focusStart = Date.now();
      }
    });
  } catch (err) {
    console.warn('[TabMind SW] onFocusChanged error:', err);
  }
});

// ─── 5. RUNTIME MESSAGES ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Wrap in an IIFE so we can use async/await cleanly with the sync listener
  (async () => {
    try {
      if (message.type === 'INTENT_SAVED') {
        const { tabId, intent } = message as { type: string; tabId: number; intent: string };
        const stored = await getTab(tabId);
        if (!stored) { sendResponse({ success: false, error: 'Tab not found' }); return; }

        const updated = { ...stored, intent };
        await setTab(tabId, updated);

        if (stored._id) {
          api.patch(`/tabs/${stored._id}`, { intent }).catch(() => {});
        }
        sendResponse({ success: true });
      }

      else if (message.type === 'INTENT_SKIPPED') {
        const { tabId } = message as { type: string; tabId: number };
        const stored = await getTab(tabId);
        if (!stored) { sendResponse({ success: false, error: 'Tab not found' }); return; }

        // Request an AI-generated intent suggestion from the backend
        const res = await api.post<{ suggestion: string }>('/tabs/ai-intent', {
          url: stored.url,
          title: stored.title,
        });

        const suggestion = res.data?.suggestion ?? '';
        const updated = { ...stored, intentSuggestion: suggestion };
        await setTab(tabId, updated);

        sendResponse({ success: true, data: { suggestion } });
      }

      else if (message.type === 'MARK_TAB_DONE') {
        const { tabId } = message as { type: string; tabId: number };
        const stored = await getTab(tabId);
        if (!stored) { sendResponse({ success: false, error: 'Tab not found' }); return; }

        const updated = { ...stored, status: 'done' as TabStatus };
        await setTab(tabId, updated);

        if (stored._id) {
          api.patch(`/tabs/${stored._id}`, { status: 'done' }).catch(() => {});
        }
        
        // Requirement: close tab on mark done from hover card/popup
        chrome.tabs.remove(tabId).catch(() => {});
        
        sendResponse({ success: true });
      }

      else if (message.type === 'GET_CURRENT_TAB_ID') {
        sendResponse({ tabId: _sender.tab?.id });
      }

      else if (message.type === 'SYNC_TOKEN') {
        const { token } = message as { type: string, token: string };
        await setToken(token);
        // Dispatch an alarm to sync everything since we're now logged in!
        chrome.alarms.create('sync_now', { delayInMinutes: 0.1 });
        sendResponse({ success: true });
      }

      else {
        sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (err) {
      console.warn('[TabMind SW] onMessage error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  })();

  // Return true to keep the message channel open for async response
  return true;
});

// ─── 6. NATIVE COMMANDS ───────────────────────────────────────────────────────

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_hover_card') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { type: 'TRIGGER_HOVER_CARD' }).catch(() => {});
      }
    });
  }
});

// ─── 7. PERIODIC SYNC ALARM ───────────────────────────────────────────────────

// Create the alarm when the service worker initialises
chrome.alarms.create('sync', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'sync' && alarm.name !== 'sync_now') return;

  try {
    const allTabs = await getAllTabs();

    for (const [chromeTabIdStr, tab] of Object.entries(allTabs)) {
      const chromeTabId = Number(chromeTabIdStr);

      // Skip tabs that already have a backend record
      if (tab._id) continue;

      // Retry posting to backend
      try {
        const response = await api.post<Tab>('/tabs', tab);
        if (response.data?._id) {
          await setTab(chromeTabId, { ...tab, _id: response.data._id });
          console.log(`[TabMind SW] Sync: posted tab ${chromeTabId} → ${response.data._id}`);
        }
      } catch {
        // Still no network — leave for next alarm cycle
      }
    }
  } catch (err) {
    console.warn('[TabMind SW] Alarm sync error:', err);
  }
});

// Keep-alive: log initialisation
console.log('[TabMind SW] Service worker started ✓');
