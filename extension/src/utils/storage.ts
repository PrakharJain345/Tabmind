import type { Tab, User, StoredTabCache } from '../types';

// ===== TOKEN HELPERS =====

/**
 * Retrieve the JWT stored in chrome.storage.local.
 */
export const getToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token'], (result) => {
      resolve(result['token'] ?? null);
    });
  });
};

/**
 * Save the JWT to chrome.storage.local.
 */
export const setToken = (token: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ token }, resolve);
  });
};

/**
 * Remove the JWT (logout).
 */
export const clearToken = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['token'], resolve);
  });
};

// ===== USER HELPERS =====

/**
 * Retrieve the cached user profile.
 */
export const getUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      resolve(result['user'] ?? null);
    });
  });
};

/**
 * Save the user profile to local storage.
 */
export const setUser = (user: User): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ user }, resolve);
  });
};

// ===== TAB CACHE HELPERS =====

/**
 * Retrieve a single Tab from the local cache by its Chrome tab ID.
 */
export const getTab = (tabId: number): Promise<Tab | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabs'], (result) => {
      const tabs: StoredTabCache = result['tabs'] ?? {};
      resolve(tabs[tabId] ?? null);
    });
  });
};

/**
 * Persist a Tab into the local cache. Merges with existing tab data.
 */
export const setTab = (tabId: number, tab: Tab): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabs'], (result) => {
      const tabs: StoredTabCache = result['tabs'] ?? {};
      tabs[tabId] = { ...tabs[tabId], ...tab };
      chrome.storage.local.set({ tabs }, resolve);
    });
  });
};

/**
 * Retrieve all tabs currently cached in local storage.
 */
export const getAllTabs = (): Promise<StoredTabCache> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabs'], (result) => {
      resolve(result['tabs'] ?? {});
    });
  });
};

/**
 * Remove a single tab from the local cache by its Chrome tab ID.
 */
export const removeTab = (tabId: number): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabs'], (result) => {
      const tabs: StoredTabCache = result['tabs'] ?? {};
      delete tabs[tabId];
      chrome.storage.local.set({ tabs }, resolve);
    });
  });
};

/**
 * Clear the entire tab cache. Used on sign-out.
 */
export const clearAllTabs = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['tabs'], resolve);
  });
};
