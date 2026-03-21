import React, { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Check, Flame, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import useTabStore from '../store/tabStore';
import api from '../utils/api';
import useSocket from '../hooks/useSocket';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';

const safeDate = (d) => {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const Dashboard = () => {
  // Initialize and attach Socket.io events
  useSocket();

  const { openTabs, setOpenTabs } = useTabStore();
  const [stats, setStats] = useState({
    totalOpened: 0,
    totalFulfilled: 0,
    totalAbandoned: 0,
    fulfillmentRate: 0,
  });
  const [patterns, setPatterns] = useState(null);
  const [streak, setStreak] = useState(3); // Mock streak
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tabsRes, overviewRes, patternsRes] = await Promise.all([
        api.get('/tabs/open'),
        api.get('/analytics/overview?timeframe=today'),
        api.get('/analytics/patterns')
      ]);
      setOpenTabs(tabsRes.data);
      setStats(overviewRes.data);
      setPatterns(patternsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      await api.patch(`/tabs/${id}/status`, { status: 'done' });
      // Real-time socket event will handle the removal from openTabs list
    } catch (error) {
      console.error('Error updating tab:', error);
    }
  };

  // Prepare data for Radial Chart (Fulfillment Rate)
  const fulfillmentData = [
    { name: 'Background', value: 100, fill: 'var(--bg-elevated)' },
    { name: 'Rate', value: stats.fulfillmentRate || 0, fill: 'var(--success)' },
  ];

  // Prepare top domains for Bar Chart (comes from stats overview)
  const topDomainsData = stats?.topDomains?.slice(0, 5).map(domain => ({
    name: domain.domain, // it returns { domain: 'youtube.com', count: x }
    count: domain.count,
  })) || [];

  // Find tabs at risk (> 2 hours)
  const tabsAtRisk = openTabs.filter(tab => {
    const hoursOpen = (new Date() - safeDate(tab.openedAt)) / (1000 * 60 * 60);
    return hoursOpen > 2;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* TOP SECTION: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-6">
        
        {/* Left: Open Tabs (Large Card) */}
        <Card className="flex flex-col min-h-[400px]">
          <h2 className="card-title">Live Tabs</h2>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 max-h-[400px]">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
            ) : openTabs.length === 0 ? (
              <div className="text-text-muted text-center py-10 text-sm">No open tabs right now. Mindful browsing! ✨</div>
            ) : (
              openTabs.map((tab) => (
                <div key={tab._id} className="card-enter flex items-center justify-between p-3 bg-bg-elevated rounded-md border border-[var(--border-default)] hover:border-[var(--border-active)] transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {tab.faviconUrl ? (
                      <img src={tab.faviconUrl} alt="favicon" className="w-5 h-5 rounded-sm flex-shrink-0 bg-white" />
                    ) : (
                      <div className="w-5 h-5 bg-[var(--border-subtle)] rounded-sm flex-shrink-0"></div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-text-primary truncate max-w-[300px]">{tab.title || tab.url}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{formatDistanceToNow(safeDate(tab.openedAt), { addSuffix: true })}</span>
                        {tab.aiIntent && (
                          <span className="bg-[rgba(124,58,237,0.15)] text-[var(--purple-300)] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {tab.aiIntent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => handleMarkDone(tab._id)} className="!px-3 !py-[6px] text-xs">
                    <Check size={14} /> Done
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Stat Cards Column */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <SkeletonCard className="h-full" />
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 text-center h-full">
              <h3 className="card-title !mb-0 text-text-muted">Today's Fulfillment</h3>
              <div className="h-[160px] w-full relative -my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={fulfillmentData} startAngle={90} endAngle={-270}>
                    <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display text-[32px] font-bold text-[var(--success)] leading-none">{stats.fulfillmentRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-8 mt-2 w-full">
                <div className="text-center">
                  <div className="text-xl font-bold text-text-primary">{stats.totalOpened}</div>
                  <div className="text-xs text-text-muted uppercase font-semibold">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--success)]">{stats.totalFulfilled}</div>
                  <div className="text-xs text-[var(--success)] uppercase font-semibold opacity-80">Fulfilled</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tabs at Risk */}
        <Card className="flex flex-col border-[var(--border-subtle)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(239,68,68,0.1)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4 z-10">
            <AlertTriangle size={18} className="text-[var(--danger)]" />
            <h3 className="card-title !mb-0 text-text-primary">Tabs at Risk</h3>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] z-10">
            {tabsAtRisk.length === 0 ? (
              <p className="text-sm text-text-muted flex items-center h-16">No stale tabs. Great job!</p>
            ) : (
              tabsAtRisk.map(tab => (
                <div key={tab._id} className="flex flex-col p-[10px] bg-[rgba(239,68,68,0.05)] rounded-md border border-[rgba(239,68,68,0.15)]">
                  <span className="text-sm font-medium text-text-primary truncate">{tab.title || tab.url}</span>
                  <span className="text-[11px] text-[var(--danger)] mt-1 font-semibold uppercase tracking-wider">
                    Open {formatDistanceToNow(safeDate(tab.openedAt))}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Domains */}
        <Card className="flex flex-col min-h-[180px]">
          <h3 className="card-title">Top Domains</h3>
          <div className="h-[120px] w-full mt-auto">
            {topDomainsData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-sm text-text-muted italic opacity-80">Browsing data is currently sparse.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDomainsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-elevated)' }} 
                    contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {topDomainsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--purple-400)' : 'var(--purple-500)'} opacity={1 - index * 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Current Streak */}
        <Card accent={false} className="flex flex-col justify-between items-start text-left p-6 border-l-[3px] border-l-[var(--pink-500)] bg-[linear-gradient(135deg,var(--red-fade)_0%,rgba(15,15,26,0.7)_100%)]">
          <div className="flex w-full items-center justify-between mb-4">
            <h3 className="card-title !mb-0 text-[var(--pink-400)] text-sm uppercase tracking-wider font-bold">Current Streak</h3>
            <Flame size={20} className="text-[var(--pink-500)] drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display text-4xl font-bold text-white leading-none">
              {streak}
            </span>
            <span className="text-text-muted text-sm font-medium">days straight</span>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
