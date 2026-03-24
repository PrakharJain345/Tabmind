import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Timer, 
  Layers, 
  BarChart3, 
  Sparkles, 
  LogOut,
  Settings
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Graveyard', path: '/graveyard', icon: Timer },
    { name: 'Sessions', path: '/sessions', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Weekly Digest', path: '/digest', icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[rgba(8,8,12,0.95)] backdrop-blur-[24px] border-r border-white/5 py-8 px-4 flex flex-col z-50">
      <div 
        className="px-3 mb-12 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <span className="text-white font-black text-lg">T</span>
        </div>
        <span 
          className="text-white text-xl font-bold tracking-tight"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          TabMind
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
              font-outfit text-[15px] font-medium tracking-wide
              ${isActive 
                ? 'bg-white/5 text-white' 
                : 'text-white/40 hover:text-white/80'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon 
                  size={18} 
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`transition-colors duration-300 ${isActive ? 'text-sky-400' : 'text-white/40 group-hover:text-white/60'}`} 
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/5 pt-8">
        <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              font-outfit text-[15px] font-medium
              ${isActive 
                ? 'bg-white/5 text-white' 
                : 'text-white/40 hover:text-white/80'}
            `}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-outfit text-[15px] font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
