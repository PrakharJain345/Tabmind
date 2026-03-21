/**
 * TabMind — Auth Sync Content Script
 * 
 * Injected into all pages. Listens for the JWT sent from the TabMind dashboard
 * via standard window.postMessage, and forwards it to the extension's background
 * script to save into chrome.storage.local.
 */

window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  if (event.data?.type === 'TABMIND_AUTH_SYNC' && event.data?.token) {
    try {
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token: event.data.token });
    } catch {
      // extension context invalidated
    }
  }
});

// Proactively check localStorage on mount if we're exactly on the dashboard domain
if (window.location.hostname === 'localhost' || window.location.hostname === 'tabmind.app') {
  try {
    const token = window.localStorage.getItem('token');
    if (token) {
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token });
    }
  } catch {
    // SecurityError if cookies are blocked, etc.
  }
}
