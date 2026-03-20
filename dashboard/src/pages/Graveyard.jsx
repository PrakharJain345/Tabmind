import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Ghost, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../utils/api';
import useTabStore from '../store/tabStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import { SkeletonRow } from '../components/ui/Skeleton';

const safeDate = (d) => {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const Graveyard = () => {
  const { graveyard, setGraveyard } = useTabStore();
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [domain, setDomain] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Stats
  const [stats, setStats] = useState({ abandoned: 0, fulfilled: 0, saved: 0 });
  const [availableDomains, setAvailableDomains] = useState([]);

  // Fetch Data
  const fetchGraveyardData = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string based on filters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (domain !== 'all') params.append('domain', domain);
      if (dateRange.from) params.append('startDate', dateRange.from);
      if (dateRange.to) params.append('endDate', dateRange.to);

      const res = await api.get(`/tabs/graveyard?${params.toString()}`);
      setGraveyard(res.data);
      
      // Calculate basic stats for this view (or fetch from a dedicated endpoint if available)
      const newStats = res.data.reduce((acc, tab) => {
        if (tab.status === 'abandoned') acc.abandoned += 1;
        if (tab.status === 'done') acc.fulfilled += 1;
        if (tab.status === 'saved') acc.saved += 1;
        return acc;
      }, { abandoned: 0, fulfilled: 0, saved: 0 });
      setStats(newStats);

      // Extract unique domains for filter dropdown
      const domains = [...new Set(res.data.map(t => t.domain).filter(Boolean))];
      setAvailableDomains(domains);

    } catch (error) {
      console.error('Error fetching graveyard:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, domain, dateRange, setGraveyard]);

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGraveyardData();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchGraveyardData]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!graveyard.length) return;
    
    // Headers
    const headers = ['URL', 'Title', 'Domain', 'Intent', 'Status', 'Opened At', 'Closed At'];
    
    // Rows
    const rows = graveyard.map(tab => [
      `"${tab.url}"`,
      `"${(tab.title || '').replace(/"/g, '""')}"`,
      `"${tab.domain || ''}"`,
      `"${(tab.aiIntent || '').replace(/"/g, '""')}"`,
      tab.status,
      `"${tab.openedAt}"`,
      `"${tab.closedAt || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tabmind_graveyard_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reopen Tab Action
  const handleReopen = async (tab) => {
    // 1. Open in new browser tab
    window.open(tab.url, '_blank');
    // 2. Patch backend to return it to 'open' state (optional logic depending on exact specs)
    try {
      await api.patch(`/tabs/${tab._id}/status`, { status: 'open' });
      // Remove from current graveyard view optimistically
      setGraveyard(graveyard.filter(t => t._id !== tab._id));
    } catch (error) {
      console.error('Failed to reopen tab via API', error);
    }
  };

  // Framer Motion Variants for Staggered List
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Helper for left border color
  const getStatusColorClass = (stat) => {
    switch (stat) {
      case 'done': return 'border-l-[var(--success)] shadow-[inset_4px_0_0_0_var(--success)]';
      case 'abandoned': return 'border-l-[var(--danger)] shadow-[inset_4px_0_0_0_var(--danger)]';
      case 'saved': return 'border-l-[var(--warning)] shadow-[inset_4px_0_0_0_var(--warning)]';
      default: return 'border-l-[var(--border-subtle)]';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      
      {/* 1. Header & Stats Row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Graveyard</h1>
          <p className="text-text-secondary mt-1">Review your closed, fulfilled, and abandoned tabs.</p>
        </div>
        <div className="flex gap-4">
          <StatCard label="Fulfilled" value={stats.fulfilled} glowColor="shadow-success" />
          <StatCard label="Abandoned" value={stats.abandoned} glowColor="shadow-danger" />
          <StatCard label="Saved" value={stats.saved} glowColor="shadow-warning" />
        </div>
      </div>

      {/* 2. Filters Row */}
      <Card className="flex flex-wrap items-center gap-4 !p-4 border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
        
        <div className="flex-1 min-w-[200px]">
          <Input 
            icon={<Search size={16} />} 
            placeholder="Search intent or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="bg-bg-elevated border border-[var(--border-default)] text-sm rounded-md px-3 py-[9px] text-text-primary outline-none focus:border-[var(--purple-500)]"
          >
            <option value="all">All Statuses</option>
            <option value="done">Fulfilled</option>
            <option value="abandoned">Abandoned</option>
            <option value="saved">Saved</option>
          </select>

          <select 
            value={domain} 
            onChange={(e) => setDomain(e.target.value)}
            className="bg-bg-elevated border border-[var(--border-default)] text-sm rounded-md px-3 py-[9px] text-text-primary outline-none focus:border-[var(--purple-500)] max-w-[150px]"
          >
            <option value="all">All Domains</option>
            {availableDomains.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <Button variant="secondary" onClick={handleExportCSV} className="!py-[9px] text-sm hidden md:flex">
          <Download size={16} /> Export CSV
        </Button>
      </Card>

      {/* 3. Tab List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array(8).fill(0).map((_, i) => (
             <SkeletonRow key={i} />
          ))}
        </div>
      ) : graveyard.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="flex flex-col gap-3"
        >
          {graveyard.map((tab) => (
            <motion.div 
              key={tab._id} 
              variants={item}
              className={`
                graveyard-row flex items-center gap-4 p-[14px] 
                bg-[rgba(15,15,26,0.6)] border border-[var(--border-subtle)] 
                rounded-lg backdrop-blur-md transition-all duration-200
                hover:border-[var(--border-default)] hover:bg-[rgba(255,255,255,0.04)]
                ${getStatusColorClass(tab.status)}
              `}
            >
              {/* Favicon */}
              {tab.faviconUrl ? (
                <img src={tab.faviconUrl} alt="" className="w-6 h-6 rounded-sm bg-white flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 bg-bg-elevated rounded-sm flex-shrink-0"></div>
              )}

              {/* Main Content Info */}
              <div className="flex flex-col flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-text-primary text-[15px] truncate">
                    {tab.aiIntent || tab.domain}
                  </span>
                  <span className="text-xs text-text-muted px-2 py-0.5 bg-bg-elevated rounded-sm">
                    {tab.domain}
                  </span>
                </div>
                <div className="text-xs text-text-secondary truncate max-w-[90%]">
                  {tab.title || tab.url}
                </div>
              </div>

              {/* Meta & Status */}
              <div className="flex items-center gap-6 flex-shrink-0 mr-4">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                    {formatDistanceToNow(safeDate(tab.openedAt), { addSuffix: true })}
                  </span>
                  <Badge status={tab.status} />
                </div>
              </div>

              {/* Actions */}
              <button 
                onClick={() => handleReopen(tab)}
                className="p-2 text-text-muted hover:text-[var(--purple-400)] hover:bg-[rgba(124,58,237,0.1)] rounded-md transition-colors tooltip-trigger relative group"
                aria-label="Reopen tab"
              >
                <ExternalLink size={18} />
                {/* Simple CSS Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-overlay border border-[var(--border-subtle)] text-xs text-text-primary px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Reopen Tab
                </span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-[var(--border-default)] rounded-xl bg-[rgba(255,255,255,0.01)] mt-4">
    <div className="w-24 h-24 mb-6 relative flex items-center justify-center bg-[rgba(59,130,246,0.1)] rounded-full">
      <Ghost size={48} className="text-[var(--purple-400)] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] blur-md"></div>
    </div>
    <h3 className="font-display text-xl font-bold text-text-primary mb-2">Your graveyard is empty</h3>
    <p className="text-text-muted max-w-md">
      Every tab you close, fulfill, or abandon will rest here. Come back later when you have some browsing history.
    </p>
  </div>
);

export default Graveyard;
