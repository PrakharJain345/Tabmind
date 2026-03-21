/**
 * TabMind â€” Intent Overlay Content Script
 *
 * Injected into every new tab page by the service worker.
 * Renders a floating UI prompt asking "Why did you open this tab?"
 * and sends the result back to the service worker via chrome.runtime.sendMessage.
 *
 * Uses purely inline styles + a Shadow DOM root so it cannot be affected
 * by the host page's CSS and cannot leak into the host page.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';// --- Constants ---
const OVERLAY_ROOT_ID = 'tabmind-overlay';

// --- Types ---
type OverlayState = 'hidden' | 'entering' | 'visible' | 'leaving';

const SHADOW_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes slideOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-8px) scale(0.98); }
  }

  .overlay {
    position: fixed;
    top: 24px;
    right: 24px;
    width: 280px;
    background: rgba(8, 8, 12, 0.98);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 20px;
    padding: 24px 24px 20px;
    box-shadow:
      0 4px 12px rgba(0,0,0,0.5),
      0 32px 64px rgba(0,0,0,0.6),
      0 0 0 1px rgba(255,255,255,0.03);
    z-index: 2147483647;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #F8FAFC;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .overlay[data-state="entering"] {
    animation: slideIn 0.4s cubic-bezier(0.2, 1, 0.2, 1) forwards;
  }
  .overlay[data-state="leaving"] {
    animation: slideOut 0.25s ease-in forwards;
  }

  .logo {
    font-family: 'Cinzel Decorative', serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: linear-gradient(to right, #FFFFFF, #94A3B8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 20px;
    text-align: center;
  }

  .divider {
    width: 30px;
    height: 1px;
    background: rgba(255,255,255,0.2);
    margin-bottom: 16px;
  }

  .question {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 500;
    font-style: italic;
    color: #F8FAFC;
    margin-bottom: 6px;
    text-align: center;
    line-height: 1.2;
  }

  .hint {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 20px;
    text-align: center;
  }

  .input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    border-radius: 0;
    padding: 8px 0;
    font-size: 14px;
    color: #F8FAFC;
    width: 100%;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    font-style: italic;
    transition: border-bottom-color 0.3s ease;
    text-align: center;
  }
  .input::placeholder {
    color: #334155;
    opacity: 0.8;
  }
  .input:focus {
    border-bottom-color: #FFFFFF;
  }

  .button-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    background: #F8FAFC;
    color: #08080C;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .btn-primary:hover:not(:disabled) {
    background: #FFFFFF;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255,255,255,0.15);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    color: #475569;
    border: none;
    padding: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s ease;
    align-self: center;
  }
  .btn-secondary:hover {
    color: #94A3B8;
  }
`;

// --- The Overlay React component ---
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
      {/* Brand Wordmark — Replaces Brain Logo */}
      <div className="logo">TabMind</div>
      
      <div className="divider" />

      <p className="question">Why did you open this?</p>
      <p className="hint">brief intent preferred</p>

      {/* Modern Underline Input */}
      <input
        ref={inputRef}
        className="input"
        type="text"
        placeholder="e.g. market research"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={120}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Modern Buttons */}
      <div className="button-row">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!intent.trim()}
        >
          Save Intent
        </button>
        <button className="btn-secondary" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

// â”€â”€â”€ Mount logic (isolated Shadow DOM) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

mountOverlay().catch(() => {
  // Silently consume — content scripts must never throw unhandled exceptions
});
