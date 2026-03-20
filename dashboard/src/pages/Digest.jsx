import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, nextMonday, setHours, setMinutes, setSeconds, differenceInSeconds } from 'date-fns';
import { Download, Calendar, Flame, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Utility for calculating the exact next Monday at 9AM
const getNextMonday9AM = () => {
  const now = new Date();
  let nextM = nextMonday(now);
  // If it's already Monday before 9 AM, we want today at 9AM.
  if (now.getDay() === 1 && now.getHours() < 9) {
    nextM = now;
  }
  return setSeconds(setMinutes(setHours(nextM, 9), 0), 0);
};

// Formats seconds into HH:MM:SS
const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const Digest = () => {
  const [loading, setLoading] = useState(true);
  const [digest, setDigest] = useState(null);
  const [countdown, setCountdown] = useState("");
  const digestCardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchLatestDigest();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (digest || loading) return;

    const target = getNextMonday9AM();
    const timer = setInterval(() => {
      const remainingSeconds = differenceInSeconds(target, new Date());
      setCountdown(formatCountdown(remainingSeconds));
    }, 1000);

    return () => clearInterval(timer);
  }, [digest, loading]);

  const fetchLatestDigest = async () => {
    try {
      const res = await api.get('/digest/latest');
      setDigest(res.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setDigest(null); // Valid state: no digest yet
      } else {
        console.error('Failed to load digest', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!digestCardRef.current || isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading('Generating image...');

    try {
      const canvas = await html2canvas(digestCardRef.current, {
        backgroundColor: '#0F0F1A', // Match bg-base
        scale: 2, // High DPI
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tabmind-digest-week-${digest?.weekNumber || 'current'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Saved to device!', { id: toastId });
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Failed to export image', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto h-[600px]">
        <div className="w-full md:w-[60%] bg-bg-surface/50 rounded-2xl animate-pulse border border-[var(--border-subtle)]" />
        <div className="w-full md:w-[40%] flex flex-col gap-6">
          <div className="h-40 bg-bg-surface/50 rounded-lg animate-pulse" />
          <div className="h-60 bg-bg-surface/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!digest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full max-w-2xl mx-auto">
        <div className="w-24 h-24 mb-6 relative flex items-center justify-center bg-[rgba(124,58,237,0.1)] rounded-full">
          <Calendar size={48} className="text-[var(--purple-400)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] blur-md"></div>
        </div>
        
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Your first digest is brewing
        </h1>
        <p className="text-text-secondary text-lg mb-8 max-w-md">
          TabMind analyzes your browsing patterns all week. Your personalized insights will be ready next Monday morning.
        </p>

        <div className="flex flex-col items-center bg-bg-elevated/50 border border-[var(--border-subtle)] rounded-xl py-6 px-12 backdrop-blur-sm">
          <span className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Ready In</span>
          <span className="font-display text-4xl font-bold text-[var(--purple-400)] tabular-nums">
            {countdown || "..."}
          </span>
        </div>
      </div>
    );
  }

  // --- DATA MAPPING ---
  // In a real scenario, the backend calculates the personality type based on fulfillment vs abandoned
  const fulfillmentThreshold = digest?.stats?.fulfillmentRate || 0;
  let personalityType = "Information Gatherer";
  let personalityDesc = "You open tabs for extensive research but often leave them hanging.";
  if (fulfillmentThreshold > 75) {
    personalityType = "The Finisher";
    personalityDesc = "You open a tab with a mission and you complete it. Highly focused.";
  } else if (digest?.stats?.totalOpened > 300) {
    personalityType = "Tab Hoarder";
    personalityDesc = "Your browser is a chaotic library of infinite possibilities.";
  } else if (fulfillmentThreshold > 50) {
    personalityType = "Balanced Navigator";
    personalityDesc = "A healthy mix of deep dives and quick tasks.";
  }

  // Placeholder for peak distraction (assume backend returns or we calculate from patterns)
  const peakTimeStr = "3:00 PM"; // Mocked if not present in schema

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto">
      
      {/* LEFT: 60% The Digest Card (Target for HTML2Canvas) */}
      <div className="w-full md:w-[60%] flex flex-col items-center">
        <div 
          ref={digestCardRef}
          className="digest-card w-full max-w-[500px] rounded-3xl p-10 flex flex-col relative overflow-hidden text-center justify-between min-h-[600px] isolate border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="z-10 flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/50">
              Week {digest.weekNumber} Report
            </span>
            <div className="flex items-center gap-2 mt-4">
              <span className="font-display text-2xl font-bold text-white">You were a</span>
            </div>
            <h2 className="font-display text-4xl font-extrabold pb-2 bg-gradient-to-r from-[var(--purple-400)] to-[var(--pink-400)] bg-clip-text text-transparent transform scale-105">
              {personalityType}
            </h2>
            <p className="text-sm text-white/70 max-w-[280px] mt-2">
              "{personalityDesc}"
            </p>
          </div>

          {/* Main Stat */}
          <div className="z-10 flex flex-col items-center justify-center my-6">
            <div className="font-display text-[80px] leading-none font-black text-white drop-shadow-[0_0_20px_rgba(167,139,250,0.5)]">
              {fulfillmentThreshold}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--success)] mt-2 flex items-center gap-1">
              Fulfillment Rate
            </span>
          </div>

          {/* 3 Mini Stats */}
          <div className="z-10 grid grid-cols-3 gap-4 w-full bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-white">{digest.stats?.totalOpened || 0}</span>
              <span className="text-[10px] uppercase text-white/50 font-semibold tracking-wider">Opened</span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-white/10">
              <span className="text-sm font-bold text-white">{digest.stats?.totalFulfilled || 0}</span>
              <span className="text-[10px] uppercase text-white/50 font-semibold tracking-wider">Fulfilled</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-white">{digest.stats?.totalAbandoned || 0}</span>
              <span className="text-[10px] uppercase text-white/50 font-semibold tracking-wider">Abandoned</span>
            </div>
          </div>

          {/* Footer inside card */}
          <div className="z-10 flex items-center justify-between w-full mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Peak Distraction</span>
              <span className="text-sm text-white font-medium">{peakTimeStr}</span>
            </div>
            <div className="font-display font-bold text-lg text-white">TabMind</div>
          </div>
        </div>

        {/* Share Button (Outside the capture div) */}
        <Button 
          className="mt-6 w-full max-w-[500px] flex items-center justify-center gap-2 py-4 text-base font-semibold"
          onClick={handleShare}
          disabled={isExporting}
        >
          {isExporting ? 'Generating...' : <><Download size={18} /> Download as PNG</>}
        </Button>
      </div>

      {/* RIGHT: 40% Stats Breakdown */}
      <div className="w-full md:w-[40%] flex flex-col gap-6">
        
        {/* Comparison Table */}
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-[var(--border-subtle)] pb-3">Weekly Change</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Tabs Opened', val: digest.stats?.totalOpened || 0, prev: 142 }, // Mock prev since we don't have historical link in schema yet
              { label: 'Fulfillment Rate', val: `${fulfillmentThreshold}%`, prev: '45%' },
              { label: 'Saved for Later', val: digest.stats?.totalSaved || 0, prev: 12 },
            ].map((stat, i) => {
              const currentNum = parseInt(stat.val) || 0;
              const prevNum = parseInt(stat.prev) || 0;
              const diffNum = currentNum - prevNum;
              const isPositive = diffNum >= 0;
              const isRate = String(stat.val).includes('%');
              
              // Good vs bad depends on the metric (more open isn't necessarily good)
              const isGood = stat.label === 'Fulfillment Rate' ? isPositive : !isPositive;

              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{stat.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">{stat.val}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isGood ? 'bg-[rgba(52,211,153,0.1)] text-[var(--success)]' : 'bg-[rgba(244,63,94,0.1)] text-[var(--danger)]'}`}>
                      {isPositive ? '+' : ''}{diffNum}{isRate ? '%' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Categories */}
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-text-primary border-b border-[var(--border-subtle)] pb-3">Dominant Themes</h3>
          <div className="flex flex-col gap-2">
            {(digest.topCategories && digest.topCategories.length > 0) ? (
              digest.topCategories.slice(0, 5).map((cat, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--purple-400)] opacity-80" />
                    <span className="text-sm text-text-primary capitalize">{cat}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-text-muted italic">Not enough data categorized yet.</span>
            )}
          </div>
        </Card>

        {/* Most Abandoned Insight */}
        <Card className="flex flex-col border-[var(--danger)] shadow-[inset_4px_0_0_0_var(--danger)] bg-[rgba(244,63,94,0.03)] pb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-[var(--danger)]" />
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--danger)]">Action Area</span>
          </div>
          <h4 className="font-semibold text-text-primary text-[15px] mb-1">High Abandon Rate</h4>
          <p className="text-sm text-text-secondary">
            You frequently start searches relating to <strong className="text-text-primary">"productivity tools"</strong> without marking them as done. 
            Try saving these to a dedicated session instead.
          </p>
        </Card>

      </div>

    </div>
  );
};

export default Digest;
