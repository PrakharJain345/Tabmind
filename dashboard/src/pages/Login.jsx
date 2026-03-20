import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Clock, BarChart2, ArrowRight } from 'lucide-react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: '#020617' }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: 1100, zIndex: 100,
        background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 0 0 1px rgba(14,165,233,0.1), 0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)',
          borderRadius: 10, padding: '6px 14px',
          fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#F8FAFC',
        }}>
          TabMind
        </div>
        <button
          onClick={handleGoogleLogin}
          style={{
            background: 'white', color: '#020617', border: 'none',
            borderRadius: 10, padding: '8px 20px',
            fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#38BDF8'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#020617'; }}
        >
          Sign in
        </button>
      </nav>

      {/* ── Dot Grid Overlay ─────────────────────────────────────────────── */}
      <div style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        position: 'absolute',
        inset: 0,
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Hero bg glow blobs ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 100% 80% at 50% -10%, rgba(14,165,233,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at -10% 100%, rgba(45,212,191,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 110% 60%, rgba(16,185,129,0.08) 0%, transparent 50%)
        `,
      }} />

      {/* ── Floating Product Demo Cards ──────────────────────────────────── */}

      {/* Intent popup card — top right */}
      <motion.div
        animate={{ y: [0, -16, -8, 0], rotate: [0, 1, -0.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '18%', right: '7%', width: 256, zIndex: 1,
          background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(14,165,233,0.12)',
        }}
        className="hidden lg:block"
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: '#38BDF8', marginBottom: 10, fontFamily: 'Inter, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Why did you open this?</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#38BDF8', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
          Research pricing for the project...
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'linear-gradient(135deg,#0EA5E9,#10B981)', color: 'white', borderRadius: 6, padding: '6px 0', fontSize: 11, fontWeight: 600, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Save</div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '6px 0', fontSize: 11, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Skip</div>
        </div>
      </motion.div>

      {/* Stats card — bottom left */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '22%', left: '6%', width: 200, zIndex: 1,
          background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        className="hidden lg:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={14} style={{ color: '#10B981' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>Today's Focus</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Fulfilled</span>
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>8 tabs</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Streak</span>
          <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>🔥 5 days</span>
        </div>
      </motion.div>

      {/* Fulfillment badge — top left */}
      <motion.div
        animate={{ y: [0, -12, -6, 0], rotate: [0, 0.5, -0.3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '28%', left: '9%', width: 176, zIndex: 1,
          background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        className="hidden lg:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <BarChart2 size={14} style={{ color: '#2DD4BF' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>Weekly Rate</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg,#38BDF8,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>73%</div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>↑ 12% from last week</div>
      </motion.div>

      {/* Hover card — bottom right */}
      <motion.div
        animate={{ y: [0, -14, -6, 0], rotate: [0, -1, 0.5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', direction: 'reverse' }}
        style={{
          position: 'absolute', bottom: '18%', right: '5%', width: 228, zIndex: 1,
          background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        className="hidden lg:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Clock size={13} style={{ color: '#94A3B8' }} />
          <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>notion.so/workspace</span>
        </div>
        <div style={{ background: 'rgba(14,165,233,0.08)', borderLeft: '2px solid #0EA5E9', borderRadius: 4, padding: '8px 10px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: '#0EA5E9', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3, fontFamily: 'Inter, sans-serif' }}>Intent</div>
          <div style={{ fontSize: 12, color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>Update sprint board</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '5px 0', fontSize: 10, fontWeight: 600, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Mark Done</div>
          <div style={{ flex: 1, background: 'rgba(14,165,233,0.1)', color: '#38BDF8', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 6, padding: '5px 0', fontSize: 10, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Edit</div>
        </div>
      </motion.div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
            animation: 'badge-pulse 3s ease-in-out infinite',
          }}
        >
          <Zap size={13} style={{ color: '#38BDF8' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#38BDF8', fontFamily: 'Inter, sans-serif' }}>Chrome Extension · Free · Open Beta</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(42px, 7vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-1px',
            color: '#F8FAFC',
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Never forget why<br />
          <span style={{
            fontFamily: '"Caveat", cursive',
            fontSize: '1.25em',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            lineHeight: 1,
            marginTop: '8px',
          }}>you opened a tab.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(16px, 2vw, 19px)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: '#94A3B8',
            maxWidth: 520,
            marginBottom: 40,
          }}
        >
          TabMind captures your intent the moment you open a tab — so you always know why you're there and whether it was worth it.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <button
            onClick={handleGoogleLogin}
            id="google-login-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: 'white', color: '#020617',
              border: 'none', borderRadius: 12,
              padding: '14px 28px',
              fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <p style={{ fontSize: 12, color: '#475569', fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Read-only access · We never store your emails
          </p>
        </motion.div>

        {/* Feature pills row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: 'flex', gap: 12, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { icon: '⚡', label: 'Intent Capture' },
            { icon: '📊', label: 'Weekly Digest' },
            { icon: '⌨️', label: 'Alt + I Shortcut' },
            { icon: '🪦', label: 'Tab Graveyard' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100, padding: '6px 14px',
              fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif',
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Google Fonts & Keyframes ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        @keyframes badge-pulse {
          0%, 100% { border-color: rgba(14,165,233,0.3); box-shadow: none; }
          50% { border-color: rgba(14,165,233,0.55); box-shadow: 0 0 20px rgba(14,165,233,0.15); }
        }
      `}</style>
    </div>
  );
};

export default Login;
