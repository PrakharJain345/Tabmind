import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Settings from '../Settings';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Settings />
      
      <main className="pl-[240px] min-h-screen relative">
        <Topbar />
        
        <div className="p-8 relative z-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none grid-overlay -z-10"></div>
    </div>
  );
};

export default Layout;
