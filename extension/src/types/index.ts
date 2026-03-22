// ===== TAB INTERFACES =====

export interface Tab {
  _id?: string;
  userId?: string;
  tabId: number;
  windowId: number;
  url: string;
  domain: string;
  title: string;
  favicon?: string;
  intent: string;
  intentSuggestion?: string;
  status: TabStatus;
  category?: string;
  sessionId?: string;
  timing: TabTiming;
  activeTime?: number; // milliseconds
  createdAt?: string;
  updatedAt?: string;
}

export type TabStatus = 'open' | 'done' | 'abandoned' | 'saved';

export interface TabTiming {
  openedAt: string;         // ISO date string
  closedAt?: string;
  lastActiveAt?: string;
  activeSeconds?: number;
}

// ===== INTENT INTERFACES =====

export interface Intent {
  text: string;
  suggestion?: string;
}

export interface AiIntentRequest {
  url: string;
  title: string;
}

export interface AiIntentResponse {
  suggestion: string;
}

// ===== SESSION INTERFACES =====

export interface Session {
  _id?: string;
  userId?: string;
  name: string;
  tabIds: string[];      // MongoDB ObjectId references
  status: SessionStatus;
  stats?: SessionStats;
  createdAt?: string;
  updatedAt?: string;
}

export type SessionStatus = 'active' | 'saved' | 'archived';

export interface SessionStats {
  totalTabs: number;
  fulfilledTabs: number;
  abandonedTabs: number;
  savedTabs: number;
  fulfillmentRate: number; // 0-100
  startedAt?: string;
  endedAt?: string;
}

// ===== USER INTERFACES =====

export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt?: string;
}

export interface UserPreferences {
  focusMode?: boolean;
  abandonTimeout?: number; // hours
  weeklyDigestEmail?: boolean;
}

// ===== API RESPONSE WRAPPERS =====

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ===== CHROME STORAGE TYPES =====

export interface StoredTabCache {
  [tabId: number]: Tab;
}

export interface ExtensionStorage {
  token?: string;
  user?: User;
  tabs?: StoredTabCache;
}

// ===== ANALYTICS INTERFACES =====

export interface AnalyticsOverview {
  totalOpened: number;
  totalFulfilled: number;
  totalAbandoned: number;
  totalSaved: number;
  fulfillmentRate: number;
  topDomains: { domain: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

// ===== MESSAGE PASSING (Popup <-> Service Worker) =====

export type MessageType =
  | 'GET_OPEN_TABS'
  | 'MARK_TAB_DONE'
  | 'SET_INTENT'
  | 'GET_USER'
  | 'OPEN_DASHBOARD';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface ExtensionMessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
