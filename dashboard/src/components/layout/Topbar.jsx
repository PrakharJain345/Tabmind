import React from 'react';
import { Settings, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTabStore from '../../store/tabStore';
import useUIStore from '../../store/uiStore';

const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const openTabsCount = useTabStore((state) => state.openTabs.length);
  const openModal = useUIStore((state) => state.openModal);

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-[var(--border-subtle)]">
      <div className="font-display text-2xl font-bold text-text-primary">
        Here's your day, <span className="bg-gradient-to-r from-[var(--purple-300)] to-[var(--pink-400)] bg-clip-text text-fill-transparent text-transparent">
          {user?.name || 'Explorer'}
        </span>!
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[var(--info-bg)] border border-[rgba(59,130,246,0.25)] px-3 py-1 rounded-full shadow-success">
          <div className="live-indicator"></div>
          <span className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wider">
            {openTabsCount} Open Tabs
          </span>
        </div>

        <button className="p-2 rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary transition-all duration-150 border border-[var(--border-subtle)]">
          <Bell size={20} />
        </button>

        <button 
          onClick={() => openModal('settings')}
          className="p-2 rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary transition-all duration-150 border border-[var(--border-subtle)]"
        >
          <Settings size={20} />
        </button>

        {user?.avatar && (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-8 h-8 rounded-full border border-[var(--border-default)]"
          />
        )}
      </div>
    </header>
  );
};

export default Topbar;
