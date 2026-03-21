import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings as SettingsIcon, 
  Brain, 
  Bell, 
  Database, 
  Info, 
  Github, 
  Download, 
  Trash2, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Settings = () => {
  const { user, updatePreferences, logout } = useAuthStore();
  const { activeModal, closeModal } = useUIStore();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  if (activeModal !== 'settings') return null;

  const prefs = user?.preferences || {
    autoPopup: true,
    aiSuggestions: true,
    popupDelay: 500,
    weeklyDigestEnabled: true,
    focusModeAlerts: false
  };

  const handleToggle = async (key, value) => {
    try {
      await updatePreferences({ [key]: value });
      toast.success('Setting updated');
    } catch (err) {
      toast.error('Failed to update setting');
    }
  };

  const handleSliderChange = async (e) => {
    const value = parseInt(e.target.value);
    try {
      await updatePreferences({ popupDelay: value });
    } catch (err) {
      toast.error('Failed to update delay');
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/tabs/export'); // Assuming this endpoint exists or I'll need to fetch all tabs
      // For now, let's fetch all tabs and create a blob
      const tabsResponse = await api.get('/tabs');
      const dataStr = JSON.stringify(tabsResponse.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tabmind-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success('Data exported successfully');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const clearGraveyard = async () => {
    if (!window.confirm('Are you sure you want to clear your graveyard? This cannot be undone.')) return;
    setIsClearing(true);
    try {
      await api.delete('/tabs/graveyard');
      toast.success('Graveyard cleared');
    } catch (err) {
      toast.error('Failed to clear graveyard');
    } finally {
      setIsClearing(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    try {
      await api.delete('/user');
      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-[#00000080] backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-bg-surface border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-bg-elevated/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--purple-500)]/10 flex items-center justify-center text-[var(--purple-400)]">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary">Settings</h2>
                <p className="text-xs text-text-secondary">Configure your digital brain experience</p>
              </div>
            </div>
            <button 
              onClick={closeModal}
              className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* 1. Intent Capture */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--purple-400)] mb-1">
                <Brain size={18} />
                <h3 className="font-display font-bold uppercase tracking-wider text-xs">Intent Capture</h3>
              </div>
              
              <div className="space-y-4 bg-bg-elevated/30 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Auto-popup</h4>
                    <p className="text-xs text-text-secondary">Show intent prompt when opening new tabs</p>
                  </div>
                  <Toggle 
                    checked={prefs.autoPopup} 
                    onChange={(val) => handleToggle('autoPopup', val)} 
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">AI Suggestions</h4>
                    <p className="text-xs text-text-secondary">Generate intent suggestions when skipped</p>
                  </div>
                  <Toggle 
                    checked={prefs.aiSuggestions} 
                    onChange={(val) => handleToggle('aiSuggestions', val)} 
                  />
                </div>

                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium text-text-primary">Popup Delay</h4>
                    <span className="text-xs text-[var(--purple-400)] font-mono">{prefs.popupDelay / 1000}s</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="3000" 
                    step="100"
                    value={prefs.popupDelay}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 bg-bg-base border border-white/5 rounded-lg appearance-none cursor-pointer accent-[var(--purple-500)]"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-1">
                    <span>Instant</span>
                    <span>3 seconds</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Notifications */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--pink-400)] mb-1">
                <Bell size={18} />
                <h3 className="font-display font-bold uppercase tracking-wider text-xs">Notifications</h3>
              </div>
              
              <div className="space-y-4 bg-bg-elevated/30 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Weekly Digest Email</h4>
                    <p className="text-xs text-text-secondary">Receive Monday morning performance reports</p>
                  </div>
                  <Toggle 
                    checked={prefs.weeklyDigestEnabled} 
                    onChange={(val) => handleToggle('weeklyDigestEnabled', val)} 
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Focus Mode Alerts</h4>
                    <p className="text-xs text-text-secondary">Get notified when straying from focus intent</p>
                  </div>
                  <Toggle 
                    checked={prefs.focusModeAlerts} 
                    onChange={(val) => handleToggle('focusModeAlerts', val)} 
                  />
                </div>
              </div>
            </section>

            {/* 3. Data Management */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Database size={18} />
                <h3 className="font-display font-bold uppercase tracking-wider text-xs">Data Management</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={exportData}
                  className="flex items-center gap-3 p-4 bg-bg-elevated/30 border border-white/5 rounded-xl hover:bg-bg-elevated/50 transition-all text-left"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Download size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Export JSON</h4>
                    <p className="text-[10px] text-text-secondary">Download all tab history</p>
                  </div>
                </button>

                <button 
                  onClick={clearGraveyard}
                  disabled={isClearing}
                  className="flex items-center gap-3 p-4 bg-bg-elevated/30 border border-white/5 rounded-xl hover:bg-red-500/5 transition-all text-left group"
                >
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400 group-hover:bg-red-500/20">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Clear Graveyard</h4>
                    <p className="text-[10px] text-text-secondary">Delete all closed tab records</p>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500 mt-1">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-500">Danger Zone</h4>
                    <p className="text-xs text-text-secondary">Deleting your account is permanent and will wipe all your data from our servers.</p>
                  </div>
                </div>

                {isDeleting ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] uppercase font-bold text-text-muted">Type <span className="text-red-500">DELETE</span> to confirm</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE..."
                        className="flex-1 bg-bg-base border border-red-500/30 rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-red-500"
                      />
                      <button 
                        onClick={deleteAccount}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setIsDeleting(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-all"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </section>

            {/* 4. About */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Info size={18} />
                <h3 className="font-display font-bold uppercase tracking-wider text-xs">About</h3>
              </div>
              
              <div className="bg-bg-elevated/30 border border-white/5 rounded-xl p-4 divide-y divide-white/5">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-sm text-text-secondary">Version</span>
                  <span className="text-xs font-mono text-text-muted">1.0.4-stable</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">GitHub Repository</span>
                  <a 
                    href="https://github.com/PrakharJain345/TabMind" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[var(--purple-400)] hover:text-[var(--purple-300)]"
                  >
                    Source Code <Github size={12} />
                  </a>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm text-text-secondary">Privacy Policy</span>
                  <button className="flex items-center gap-1.5 text-xs text-[var(--purple-400)] hover:text-[var(--purple-300)]">
                    Read Policy <ShieldCheck size={12} />
                  </button>
                </div>
              </div>
            </section>

          </div>

          <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-bg-elevated/50 flex items-center justify-between">
            <p className="text-[10px] text-text-muted">TabMind © 2026 · Built for focused minds.</p>
            <div className="flex items-center gap-2 text-[10px] text-[var(--purple-400)]">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              All systems operational
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      checked ? 'bg-[var(--purple-500)]' : 'bg-white/10'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default Settings;
