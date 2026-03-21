import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ghost, 
  Layers, 
  BarChart3, 
  Zap, 
  LogOut,
  Settings
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Graveyard', path: '/graveyard', icon: Ghost },
    { name: 'Sessions', path: '/sessions', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Weekly Digest', path: '/digest', icon: Zap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[rgba(15,15,26,0.8)] backdrop-blur-[20px] border-r border-[var(--border-subtle)] py-6 px-3 flex flex-col z-50">
      <div className="font-display text-lg font-bold text-text-primary px-3 mb-10 tracking-tight">
        TabMind
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-[10px] px-3 py-[10px] rounded-md transition-all duration-150
              font-ui text-base font-medium
              ${isActive 
                ? 'bg-[rgba(124,58,237,0.15)] text-[var(--purple-300)] border border-[rgba(124,58,237,0.2)]' 
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}
            `}
          >
            <item.icon size={20} className={({ isActive }) => isActive ? 'text-[var(--purple-400)]' : ''} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-6">
        <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center gap-[10px] px-3 py-[10px] rounded-md transition-all duration-150
              font-ui text-base font-medium
              ${isActive 
                ? 'bg-[rgba(124,58,237,0.15)] text-[var(--purple-300)] border border-[rgba(124,58,237,0.2)]' 
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}
            `}
          >
            <Settings size={20} />
            <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-[10px] px-3 py-[10px] rounded-md transition-all duration-150 font-ui text-base font-medium text-text-secondary hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
