/**
 * TabMind — Tab Context Hover Card
 *
 * Triggered by Ctrl+Shift+I.
 * Displays a persistent card with tab metadata and quick actions.
 * Encapsulated in Shadow DOM for CSS isolation.
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  CheckCircle2, 
  Edit3, 
  Save, 
  Clock, 
  Activity,
  Check
} from 'lucide-react';

const OVERLAY_ROOT_ID = 'tabmind-hover-card-root';
const AUTO_DISMISS_MS = 4000;

// ─── Shadow DOM CSS ──────────────────────────────────────────────────────────
const SHADOW_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700&display=swap');

  * { box-sizing: border-box; }

  @keyframes slideDown {
    from { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
    to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
  }

  @keyframes slideUp {
    from { opacity: 1; transform: translate(-50%, 0) scale(1); }
    to   { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
  }

  .wrapper {
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    z-index: 2147483647;
    pointer-events: auto;
    font-family: 'Inter', sans-serif;
  }

  .card {
    background: rgba(15, 15, 26, 0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 
      0 10px 30px -10px rgba(0,0,0,0.5),
      0 0 0 1px rgba(124, 58, 237, 0.2),
      0 0 20px rgba(124, 58, 237, 0.1);
    color: #F8FAFC;
    animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .card.leaving {
    animation: slideUp 0.2s ease-in forwards;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .favicon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .title {
    font-size: 13px;
    font-weight: 500;
    color: #94A3B8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .intent-box {
    background: rgba(124, 58, 237, 0.08);
    border-left: 2px solid #7C3AED;
    border-radius: 4px;
    padding: 10px 12px;
    margin-bottom: 16px;
  }

  .intent-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #7C3AED;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .intent-text {
    font-size: 14px;
    color: #F8FAFC;
    font-weight: 500;
    line-height: 1.4;
  }

  .input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(124, 58, 237, 0.3);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 14px;
    color: #F8FAFC;
    width: 100%;
    outline: none;
    font-family: inherit;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #475569;
    font-size: 11px;
  }

  .meta-icon {
    width: 12px;
    height: 12px;
  }

  .meta-value {
    color: #94A3B8;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    flex: 1;
    height: 36px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn-done {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  .btn-done:hover { background: rgba(16, 185, 129, 0.2); }

  .btn-edit {
    background: rgba(124, 58, 237, 0.1);
    color: #A78BFA;
    border: 1px solid rgba(124, 58, 237, 0.2);
  }
  .btn-edit:hover { background: rgba(124, 58, 237, 0.2); }

  .btn-save {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  .btn-save:hover { background: rgba(245, 158, 11, 0.2); }
  
  .toast {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: #10B981;
    color: white;
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toast.visible {
    opacity: 1;
    bottom: -60px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const HoverCard: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [tab, setTab] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dismissTimer = useRef<any>(null);

  const fetchTab = async () => {
    try {
      chrome.storage.local.get(['tabs'], (res) => {
        // Need to ask SW for current tab ID
        chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_ID' }, (resp) => {
          const tabId = resp?.tabId;
          if (tabId && res.tabs?.[tabId]) {
            const t = res.tabs[tabId];
            setTab(t);
            setEditValue(t.intent || '');
          }
        });
      });
    } catch (e) {
      console.error('HoverCard: Failed to fetch tab', e);
    }
  };

  useEffect(() => {
    fetchTab();
    resetTimer();
    return () => clearTimeout(dismissTimer.current);
  }, []);

  const resetTimer = () => {
    if (isEditing) {
      clearTimeout(dismissTimer.current);
      return;
    }
    clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(handleDismiss, AUTO_DISMISS_MS);
  };

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  const handleMarkDone = () => {
    if (!tab) return;
    chrome.runtime.sendMessage({ type: 'MARK_TAB_DONE', tabId: tab.tabId }, () => {
      setShowToast(true);
      setTimeout(() => {
        handleDismiss();
        // SW should handle closing the tab
      }, 1000);
    });
  };

  const handleSaveIntent = () => {
    if (!tab) return;
    chrome.runtime.sendMessage({ 
      type: 'INTENT_SAVED', 
      tabId: tab.tabId, 
      intent: editValue 
    }, () => {
      setTab({ ...tab, intent: editValue });
      setIsEditing(false);
      resetTimer();
    });
  };

  const formatMinutes = (isoString?: string) => {
    if (!isoString) return '0m';
    const parsedTime = new Date(isoString).getTime();
    if (isNaN(parsedTime)) return '0m'; // Safety check for invalid dates
    const mins = Math.max(0, Math.floor((Date.now() - parsedTime) / 60000));
    return `${mins}m`;
  };

  const formatActive = (seconds?: number) => {
    if (!seconds) return '0m';
    return `${Math.floor(seconds / 60)}m`;
  };

  if (!tab) return null;

  return (
    <div className="wrapper" onMouseEnter={() => clearTimeout(dismissTimer.current)} onMouseLeave={resetTimer}>
      <div className={`card ${isLeaving ? 'leaving' : ''}`}>
        <div className="header">
          <img src={tab.favicon || 'https://www.google.com/s2/favicons?domain=google.com'} className="favicon" alt="icon" />
          <div className="title">{tab.title}</div>
        </div>

        <div className="intent-box">
          <div className="intent-label">Current Intent</div>
          {isEditing ? (
            <input 
              autoFocus
              className="input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveIntent();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
          ) : (
            <div className="intent-text">"{tab.intent || 'Thinking...'}"</div>
          )}
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <Clock className="meta-icon" />
            <span>Opened <span className="meta-value">{formatMinutes(tab.timing?.openedAt)}</span> ago</span>
          </div>
          <div className="meta-item">
            <Activity className="meta-icon" />
            <span>Active for <span className="meta-value">{formatActive(tab.timing?.activeSeconds)}</span></span>
          </div>
        </div>

        <div className="actions">
          {isEditing ? (
            <button className="btn btn-save" onClick={handleSaveIntent}>
              <Save size={14} /> Save
            </button>
          ) : (
            <>
              <button className="btn btn-done" onClick={handleMarkDone}>
                <CheckCircle2 size={14} /> Mark Done
              </button>
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                <Edit3 size={14} /> Edit
              </button>
            </>
          )}
        </div>

        <div className={`toast ${showToast ? 'visible' : ''}`}>
          <Check size={14} /> Tab fulfilled ✓
        </div>
      </div>
    </div>
  );
};

// ─── Injection Logic ─────────────────────────────────────────────────────────

let root: any = null;

const inject = () => {
  if (document.getElementById(OVERLAY_ROOT_ID)) return;

  const container = document.createElement('div');
  container.id = OVERLAY_ROOT_ID;
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = SHADOW_CSS;
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);
  document.body.appendChild(container);

  root = ReactDOM.createRoot(mountPoint);
  root.render(<HoverCard onDismiss={remove} />);
};

const remove = () => {
  if (root) {
    root.unmount();
    root = null;
  }
  const container = document.getElementById(OVERLAY_ROOT_ID);
  if (container) container.remove();
};

// ─── Listener ───────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRIGGER_HOVER_CARD') {
    inject();
  }
});

window.addEventListener('keydown', (e) => {
  // Alt + I (Option + I on Mac)
  if (e.altKey && e.key.toLowerCase() === 'i') {
    e.preventDefault();
    inject();
  }
});
