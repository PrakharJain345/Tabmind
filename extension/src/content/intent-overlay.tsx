/**
 * TabMind — Intent Overlay Content Script
 *
 * Injected into every new tab page by the service worker.
 * Renders a floating UI prompt asking "Why did you open this tab?"
 * and sends the result back to the service worker via chrome.runtime.sendMessage.
 *
 * Uses purely inline styles + a Shadow DOM root so it cannot be affected
 * by the host page's CSS and cannot leak into the host page.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// ─── Constants ────────────────────────────────────────────────────────────────
const OVERLAY_ROOT_ID = 'tabmind-overlay';

// ─── Types ────────────────────────────────────────────────────────────────────
type OverlayState = 'hidden' | 'entering' | 'visible' | 'leaving';

// ─── Keyframe CSS injected into the Shadow DOM ────────────────────────────────
const SHADOW_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(20px) scale(0.95); }
  }
  .overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: rgba(15, 15, 26, 0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(124, 58, 237, 0.3);
    border-radius: 20px;
    padding: 20px;
    box-shadow:
      0 4px 6px rgba(0,0,0,0.4),
      0 16px 40px rgba(0,0,0,0.4),
      0 0 0 1px rgba(124, 58, 237, 0.1),
      0 8px 40px rgba(124, 58, 237, 0.15);
    z-index: 2147483647;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #F8FAFC;
  }

  .overlay[data-state="entering"] {
    animation: slideIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .overlay[data-state="leaving"] {
    animation: slideOut 0.18s ease-in forwards;
  }

  .emoji {
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
    line-height: 1;
  }

  .question {
    font-size: 14px;
    font-weight: 600;
    color: #F8FAFC;
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  .hint {
    font-size: 11px;
    color: #475569;
    margin: 0 0 12px 0;
  }

  .input {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: #F8FAFC;
    width: 100%;
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  .input::placeholder {
    color: #475569;
  }

  .input:focus {
    border-color: #7C3AED;
    box-shadow: 0 0 0 1px rgba(124,58,237,0.5), 0 4px 20px rgba(124,58,237,0.25);
    background: rgba(255, 255, 255, 0.06);
  }

  .button-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .btn-primary {
    flex: 1;
    background: #7C3AED;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
  }

  .btn-primary:hover {
    background: #8B5CF6;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.5);
    transform: translateY(-1px);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: transparent;
    color: #94A3B8;
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .btn-secondary:hover {
    background: #16162A;
    color: #F8FAFC;
    border-color: rgba(124, 58, 237, 0.50);
  }
`;

// ─── The Overlay React component ──────────────────────────────────────────────
const IntentOverlay: React.FC<{ tabId: number; onDismiss: () => void }> = ({ tabId, onDismiss }) => {
  const [intent, setIntent] = useState('');
  const [state, setState] = useState<OverlayState>('hidden');
  const inputRef = useRef<HTMLInputElement>(null);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(
    (leaveImmediately = false) => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;

      if (leaveImmediately) {
        onDismiss();
        return;
      }
      setState('leaving');
      setTimeout(onDismiss, 200);
    },
    [onDismiss]
  );

  // Animate in after 300ms
  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setState('entering');
      // After animation, set to visible
      setTimeout(() => setState('visible'), 200);
    }, 300);

    return () => clearTimeout(enterTimer);
  }, []);

  // Focus the input after animation in
  useEffect(() => {
    if (state === 'visible') {
      inputRef.current?.focus();
    }
  }, [state]);

  const handleSave = () => {
    if (!intent.trim()) return;
    try {
      chrome.runtime.sendMessage({ type: 'INTENT_SAVED', tabId, intent: intent.trim() });
    } catch { /* silently fail if context is invalidated */ }
    dismiss();
  };

  const handleSkip = useCallback(() => {
    try {
      chrome.runtime.sendMessage({ type: 'INTENT_SKIPPED', tabId });
    } catch { /* silently fail */ }
    dismiss();
  }, [tabId, dismiss]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleSkip();
  };

  if (state === 'hidden') return null;

  return (
    <div className="overlay" data-state={state === 'leaving' ? 'leaving' : 'entering'}>
      {/* Header */}
      <span className="emoji">🧠</span>
      <p className="question">Why did you open this?</p>
      <p className="hint">5 words is enough</p>

      {/* Input */}
      <input
        ref={inputRef}
        className="input"
        type="text"
        placeholder="e.g. research for project report"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={120}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Action buttons */}
      <div className="button-row">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!intent.trim()}
        >
          Save ✓
        </button>
        <button className="btn-secondary" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  );
};

// ─── Mount logic (isolated Shadow DOM) ────────────────────────────────────────

async function mountOverlay() {
  // 1. Bail if already mounted
  if (document.getElementById(OVERLAY_ROOT_ID)) return;

  // 2. Only show on real navigation pages
  if (!document.body) return;
  const url = window.location.href;
  if (!url.startsWith('http')) return;

  // 3. Check if this tab already has an intent stored
  const tabId = await getCurrentTabId();
  if (tabId === null) return;

  const hasExistingIntent = await checkExistingIntent(tabId);
  if (hasExistingIntent) return;

  // 4. Create an isolated host element
  const host = document.createElement('div');
  host.id = OVERLAY_ROOT_ID;
  host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';

  // Attach a Shadow DOM for full CSS isolation
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject scoped keyframe CSS into the shadow root
  const styleEl = document.createElement('style');
  styleEl.textContent = SHADOW_CSS;
  shadow.appendChild(styleEl);

  // Create the React root inside the Shadow DOM
  const mountPoint = document.createElement('div');
  mountPoint.style.pointerEvents = 'auto';
  shadow.appendChild(mountPoint);

  document.body.appendChild(host);

  const root = ReactDOM.createRoot(mountPoint);

  const unmount = () => {
    setTimeout(() => {
      try {
        root.unmount();
        host.remove();
      } catch { /* ignore */ }
    }, 250);
  };

  root.render(
    <React.StrictMode>
      <IntentOverlay tabId={tabId} onDismiss={unmount} />
    </React.StrictMode>
  );
}

/** Ask the service worker for the current tab's Chrome tab ID. */
async function getCurrentTabId(): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      // content scripts have access to the tab directly via chrome.runtime
      const id = chrome.devtools?.inspectedWindow?.tabId;
      if (id) { resolve(id); return; }

      // Fallback: ask the service worker
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_ID' }, (response) => {
        if (chrome.runtime.lastError) { resolve(null); return; }
        resolve(response?.tabId ?? null);
      });
    } catch {
      resolve(null);
    }
  });
}

/** Check chrome.storage.local for an existing intent on this tab. */
async function checkExistingIntent(tabId: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(['tabs'], (result) => {
        const tabs = result['tabs'] ?? {};
        const tab = tabs[tabId];
        resolve(Boolean(tab?.intent));
      });
    } catch {
      resolve(false);
    }
  });
}

// ─── Entry point ──────────────────────────────────────────────────────────────
mountOverlay().catch(() => {
  // Silently consume — content scripts must never throw unhandled exceptions
});
