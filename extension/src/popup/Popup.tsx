import { useState, useEffect } from 'react';
import { 
  Settings, 
  ExternalLink, 
  CheckCircle2, 
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { getUser, getAllTabs, setTab } from '../utils/storage';
import type { User, Tab, TabStatus } from '../types';

const Popup = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, allTabsData] = await Promise.all([
          getUser(),
          getAllTabs(),
        ]);
        setUser(userData);
        setTabs(Object.values(allTabsData));
        setFocusMode(userData?.preferences?.focusMode ?? false);
      } catch (error) {
        console.error('Error fetching popup data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    open: tabs.filter(t => t.status === 'open').length,
    fulfilled: tabs.filter(t => t.status === 'done').length,
    abandoned: tabs.filter(t => t.status === 'abandoned').length,
  };

  const fulfillmentRate = stats.fulfilled + stats.abandoned > 0
    ? Math.round((stats.fulfilled / (stats.fulfilled + stats.abandoned)) * 100)
    : 0;

  const handleMarkDone = async (tabId: number) => {
    const tab = tabs.find(t => t.tabId === tabId);
    if (tab) {
      const updatedTab = { ...tab, status: 'done' as TabStatus };
      await setTab(tabId, updatedTab);
      setTabs(tabs.map(t => t.tabId === tabId ? updatedTab : t));
      
      // Notify background script to sync with backend
      try {
        chrome.runtime.sendMessage({ type: 'MARK_TAB_DONE', tabId });
      } catch (err) {
        console.warn('Could not notify background script:', err);
      }
    }
  };

  const toggleFocusMode = () => {
    const newState = !focusMode;
    setFocusMode(newState);
    // Persist to user preferences if needed, but for now just local state
    // In a real app, you'd call an API here
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  };

  if (loading) {
    return (
      <div className="w-[320px] h-[480px] bg-bg-base text-text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[480px] bg-bg-base text-text-primary flex flex-col font-ui overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-display font-bold text-lg">
            T
          </div>
          <span className="font-display font-bold text-lg tracking-tight">TabMind</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary truncate max-w-[60px]">{user.name.split(' ')[0]}</span>
              <img 
                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=TabMind'} 
                alt="Avatar" 
                className="w-6 h-6 rounded-full border border-white/10"
              />
            </div>
          )}
          <Settings className="w-4 h-4 text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stats & Ring */}
        <div className="flex items-center justify-between bg-bg-surface p-4 rounded-xl border border-white/5 shadow-card">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-info"></div>
              <span className="text-xs text-text-secondary">Open: </span>
              <span className="text-xs font-bold">{stats.open}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs text-text-secondary">Done: </span>
              <span className="text-xs font-bold">{stats.fulfilled}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              <span className="text-xs text-text-secondary">Abnd: </span>
              <span className="text-xs font-bold">{stats.abandoned}</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (fulfillmentRate / 100) * 213.6}
                className="text-purple-500 transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-xl leading-none">{fulfillmentRate}%</span>
            </div>
          </div>
        </div>

        {/* Recent Intents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-secondary">Recent Tabs</h3>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Last 5</span>
          </div>
          
          <div className="space-y-2">
            {tabs.slice(-5).reverse().map((tab) => (
              <div 
                key={tab.tabId} 
                className="group p-3 rounded-lg bg-bg-elevated border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={tab.favicon || 'https://www.google.com/s2/favicons?domain=google.com'} 
                    alt="fav" 
                    className="w-4 h-4 mt-1 rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{tab.title}</p>
                    <p className="text-[11px] text-purple-300 font-medium italic mt-0.5 mt-1 line-clamp-1 italic">
                      "{tab.intent || 'No intent set...'}"
                    </p>
                  </div>
                  {tab.status === 'open' ? (
                    <button 
                      onClick={() => handleMarkDone(tab.tabId)}
                      className="p-1.5 rounded-md hover:bg-success/10 text-text-muted hover:text-success transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className={`p-1 text-[10px] font-bold uppercase rounded ${
                      tab.status === 'done' ? 'text-success' : 'text-danger'
                    }`}>
                      {tab.status === 'done' ? 'Done' : 'Lost'}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tabs.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                <p className="text-xs text-text-muted">No tabs tracked yet today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-bg-surface border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${focusMode ? 'text-warning fill-warning' : 'text-text-muted'}`} />
            <span className="text-xs font-medium text-text-secondary">Focus Mode</span>
          </div>
          <button 
            onClick={toggleFocusMode}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
              focusMode ? 'bg-purple-500' : 'bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                focusMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button 
          onClick={openDashboard}
          className="w-full h-11 bg-bg-overlay hover:bg-bg-elevated text-text-primary border border-white/5 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm shadow-card active:scale-[0.98]"
        >
          <LayoutDashboard className="w-4 h-4 text-purple-400" />
          Open Dashboard
          <ExternalLink className="w-3 h-3 text-text-muted" />
        </button>
      </div>
    </div>
  );
};

export default Popup;
