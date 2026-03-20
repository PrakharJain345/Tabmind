import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import useTabStore from '../store/tabStore';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Skeleton';

const SessionCard = ({ session }) => {
  const [expanded, setExpanded] = useState(false);

  const stats = session.tabs.reduce((acc, tab) => {
    if (tab.status === 'done') acc.fulfilled++;
    return acc;
  }, { fulfilled: 0 });

  const fulfillmentRate = Math.round((stats.fulfilled / session.tabs.length) * 100);

  const handleOpenAll = () => {
    session.tabs.forEach(tab => {
      window.open(tab.url, '_blank');
    });
    toast.success(`Opening ${session.tabs.length} tabs...`);
  };

  return (
    <Card className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 ${expanded ? 'row-span-2' : ''}`}>
      <div 
        className="flex items-start justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="font-display text-lg font-bold text-text-primary truncate">
            {session.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge status="pending" label={`${session.tabs.length} Tabs`} />
            <span className="text-[11px] text-text-muted">
              {format(new Date(session.startedAt), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>
        <div className="text-text-muted hover:text-text-primary transition-colors">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider">
          <span className="text-text-muted">Fulfillment</span>
          <span className={fulfillmentRate >= 80 ? 'text-[var(--success)]' : 'text-[var(--purple-300)]'}>
            {fulfillmentRate}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${fulfillmentRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${fulfillmentRate >= 80 ? 'bg-[var(--success)]' : 'bg-[var(--purple-500)]'}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <Badge status={session.status === 'active' ? 'open' : 'saved'} label={session.status} />
        <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={(e) => { e.stopPropagation(); handleOpenAll(); }}>
          <ExternalLink size={14} className="mr-1" /> Open All
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
              {session.tabs.map((tab) => (
                <div key={tab._id} className="flex items-center justify-between p-2 bg-bg-elevated/50 rounded-md border border-[var(--border-subtle)]">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="text-sm font-medium text-text-primary truncate">{tab.title || tab.url}</span>
                    <span className="text-[10px] text-text-muted truncate">
                      {tab.aiIntent || tab.domain}
                    </span>
                  </div>
                  <Badge status={tab.status} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const Sessions = () => {
  const { sessions, setSessions, openTabs, addSession } = useTabStore();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    if (openTabs.length === 0) {
      toast.error('No open tabs to save in session');
      return;
    }

    try {
      const res = await api.post('/sessions', {
        name: sessionName,
        tabs: openTabs.map(t => t._id)
      });
      addSession(res.data);
      toast.success('Session saved successfully!');
      setIsModalOpen(false);
      setSessionName('');
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">Focus Sessions</h1>
          <p className="text-text-secondary mt-1">Organize your thought streams into dedicated workspaces.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={18} /> Save Current Session
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-default)] rounded-xl bg-bg-surface/20">
          <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4">
            <BookOpen size={30} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No sessions saved yet</h3>
          <p className="text-text-secondary max-w-sm mt-2">
            Sessions are groups of tabs you were working on together.
            Save your current focus to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Save Current Session"
      >
        <div className="flex flex-col gap-6">
          <p className="text-text-secondary text-sm">
            This will group all <strong>{openTabs.length}</strong> currently open tabs into a new session.
          </p>
          <Input 
            placeholder="e.g. Project Research, Flight Hunt..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSession}>Save Session</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sessions;
