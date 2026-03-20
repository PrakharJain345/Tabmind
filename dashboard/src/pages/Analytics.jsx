import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import api from '../utils/api';
import Card from '../components/ui/Card';
import { SkeletonCard, SkeletonLine } from '../components/ui/Skeleton';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to determine Heatmap cell color based on count
const getHeatmapColor = (count, maxCount) => {
  if (count === 0) return 'rgba(255,255,255,0.03)';
  const ratio = count / maxCount;
  if (ratio < 0.25) return 'rgba(124, 58, 237, 0.2)';
  if (ratio < 0.5) return 'rgba(124, 58, 237, 0.4)';
  if (ratio < 0.75) return 'rgba(124, 58, 237, 0.7)';
  return 'rgba(124, 58, 237, 1)';
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg shadow-elevated">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [patterns, setPatterns] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, patternsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/patterns')
      ]);
      setOverview(overviewRes.data);
      setPatterns(patternsRes.data);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatter for Trend X Axis (MM-DD)
  const formatXAxisDate = (tickItem) => {
    try {
      return format(parseISO(tickItem), 'MMM d');
    } catch {
      return tickItem;
    }
  };

  // Memoized calculations
  const maxHeatmapCount = useMemo(() => {
    if (!patterns?.heatmapData) return 1;
    let max = 1;
    patterns.heatmapData.forEach(day => {
      day.hours.forEach(hr => {
        if (hr.count > max) max = hr.count;
      });
    });
    return max;
  }, [patterns]);

  const PIE_COLORS = ['#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#9ca3af'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <SkeletonLine className="h-20 w-1/2" />
        <SkeletonCard className="h-[350px]" />
        <SkeletonCard className="h-[250px]" />
        <div className="grid grid-cols-2 gap-6">
          <SkeletonCard className="h-[300px]" />
          <SkeletonCard className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-text-secondary mt-1">Deep insights into your browsing habits and focus patterns.</p>
        </div>
      </div>

      {/* 1. Fulfillment Trend Line Chart */}
      <motion.div variants={itemVariants}>
        <Card className="flex flex-col min-h-[400px]">
          <h2 className="card-title">Productivity Trend (30 Days)</h2>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patterns?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxisDate} 
                  tick={{ fontSize: 12, fill: '#475569' }} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#475569' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tabsOpened" 
                  name="Opened" 
                  stroke="var(--purple-500)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--purple-400)", stroke: "var(--bg-base)", strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tabsFulfilled" 
                  name="Fulfilled" 
                  stroke="var(--success)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--success)", stroke: "var(--bg-base)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* 2. Custom SVG Heatmap */}
      <motion.div variants={itemVariants}>
        <Card className="flex flex-col">
          <h2 className="card-title">Activity Heatmap (24x7)</h2>
          <div className="flex w-full mt-4 overflow-x-auto pb-4">
            <div className="flex flex-col gap-[4px] min-w-[700px] w-full">
              
              {/* X-Axis Header (Hours) */}
              <div className="flex ml-8 text-[10px] text-text-muted mb-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i % 4 === 0 ? `${i}h` : ''}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              {patterns?.heatmapData?.map((dayRow) => (
                <div key={dayRow.day} className="flex items-center gap-[4px]">
                  {/* Y-Axis Label (Days) */}
                  <div className="w-8 text-[11px] text-text-muted font-medium text-right pr-2">
                    {DAYS[dayRow.day]}
                  </div>
                  
                  {/* Heatmap Cells */}
                  <div className="flex flex-1 gap-[4px] h-[24px]">
                    {dayRow.hours.map((hr) => (
                      <div 
                        key={hr.hour}
                        className="flex-1 rounded-sm relative group cursor-crosshair transition-all duration-200 hover:ring-1 hover:ring-[var(--purple-300)]"
                        style={{ backgroundColor: getHeatmapColor(hr.count, maxHeatmapCount) }}
                      >
                        {/* Custom SVG Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[11px] text-text-primary px-2 py-1 rounded shadow-elevated pointer-events-none whitespace-nowrap z-10 transition-opacity">
                          {hr.count} tabs at {hr.hour}:00 on {DAYS[dayRow.day]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3. Bottom Row (Pie & Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="flex flex-col h-full min-h-[350px]">
            <h2 className="card-title">Top Categories</h2>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={overview?.categoryBreakdown || []}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {(overview?.categoryBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {(overview?.categoryBreakdown || []).slice(0, 5).map((entry, index) => (
                <div key={entry.category} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                  <span className="capitalize">{entry.category || 'Uncategorized'}</span>
                  <span className="opacity-50">({entry.count})</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Top Domains Horizontal Bar */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="flex flex-col h-full min-h-[350px]">
            <h2 className="card-title">Top 10 Domains</h2>
            <div className="flex-1 w-full min-h-[250px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.topDomains?.slice(0, 10) || []} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="domain" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={90} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tabs" fill="var(--pink-500)" radius={[0, 4, 4, 0]} barSize={12}>
                    {(overview?.topDomains || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`rgba(236, 72, 153, ${1 - index * 0.08})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Analytics;
