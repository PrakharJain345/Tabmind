import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Clock, BarChart2, ArrowRight, Activity, TrendingUp, Command, Trash2, Github } from 'lucide-react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: '#020617' }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: 960, zIndex: 100,
        background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 20,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 0 0 1px rgba(14, 165, 233, 0.1), 0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(14, 165, 233, 0.05)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', padding: '6px 14px',
          fontFamily: '"Outfit", sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', color: '#F8FAFC',
          textTransform: 'uppercase'
        }}>
          TabMind
        </div>
        <div className="flex gap-10 items-center px-4">
          <a href="#features" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-[0.25em]">Features</a>
          <a href="#about" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-[0.25em]">About</a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoogleLogin}
            className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-[0.25em] px-2"
          >
            Sign in
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <button
            onClick={handleGoogleLogin}
            className="px-6 py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold rounded-full hover:bg-sky-500/20 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all uppercase tracking-[0.2em]"
          >
            Get Started
          </button>
          
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          
          <a
            href="https://github.com/PrakharJain345/Tabmind"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
            title="View on GitHub"
          >
            <Github size={18} className="group-hover:scale-110 transition-transform" />
          </a>
        </div>
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

      {/* Sidebars moved inside Hero section to avoid scroll overlaps */}

      {/* Floating Demo Cards Removed for Minimalist Aesthetic */}

      {/* ── Main Content Scroll Container ────────────────────────────────── */}
      <div className="relative z-[2] w-full overflow-y-auto overflow-x-hidden h-screen snap-y snap-proximity scroll-smooth">
        
        {/* ── Section: Hero ─────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 snap-start relative">
          
          {/* Sidebars Restricted to ONLY Hero to prevent overlap during scroll */}
          {/* Left Sidebar */}
          <div style={{
            position: 'absolute', top: '50%', left: '3%', transform: 'translateY(-50%)',
            width: 220, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10,
          }} className="hidden 2xl:flex">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mb-4 px-2 text-left">Activity Stream</p>
            {[
              { label: 'System optimized', meta: 'Just now', active: true },
              { label: '4 tabs hibernated', meta: '2m ago', active: false },
              { label: 'Deep focus detected', meta: '5m ago', active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 opacity-40">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div className="text-left">
                  <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div style={{
            position: 'absolute', top: '50%', right: '3%', transform: 'translateY(-50%)',
            width: 240, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20,
          }} className="hidden 2xl:flex">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] px-2 text-right">Performance Index</p>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl text-left opacity-60">
              <div className="text-3xl font-light text-white tracking-tight">82%</div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Efficiency</p>
            </div>
          </div>

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: 'flex', gap: 12, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { icon: <Zap size={12} />, label: 'Intent Capture' },
            { icon: <Activity size={12} />, label: 'Weekly Digest' },
            { icon: <Clock size={12} />, label: 'Focus Analysis' },
            { icon: <CheckCircle size={12} />, label: 'Tab Control' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 100, padding: '8px 16px',
              fontSize: 11, fontWeight: 500, color: '#64748B', fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              <span className="text-sky-500/60">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

        {/* ── Section: Features (The High-Fidelity Stack) ────────────────── */}
        <section id="features" className="min-h-screen py-32 px-10 max-w-6xl mx-auto snap-start flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 text-left border-l-2 border-sky-500/20 pl-10"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-none">
              A browser that <br/> <span className="text-sky-500">knows your time.</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
              Generic browsers are built for consumption. <br/>
              TabMind is built for your production.
            </p>
          </motion.div>

          <div className="space-y-4">
            {/* Feature Row 1: Intent */}
            <motion.div 
              whileHover={{ x: 10 }}
              className="group bg-slate-900/20 border-y border-white/5 py-16 flex flex-col md:flex-row items-center gap-16 transition-all"
            >
              <div className="flex-1">
                <div className="text-sky-400 font-mono text-xs mb-4">01 // PSYCHOLOGY</div>
                <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Intent-First Browsing</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  We don't just open tabs. We capture the "Why." Before you lose 3 hours in a rabbit hole, TabMind asks for your commitment.
                </p>
              </div>
              <div className="w-full md:w-[400px] h-[240px] bg-slate-800/30 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                 <Zap size={80} className="text-sky-500/20" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
              </div>
            </motion.div>

            {/* Feature Row 2: Hibernation */}
            <motion.div 
              whileHover={{ x: -10 }}
              className="group border-b border-white/5 py-16 flex flex-col md:flex-row-reverse items-center gap-16 transition-all"
            >
              <div className="flex-1 text-left md:text-right">
                <div className="text-emerald-400 font-mono text-xs mb-4">02 // ARCHITECTURE</div>
                <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Hibernation Engine</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md ml-auto">
                  TabMind identifies stale context and freezes it. Save your RAM for what matters: the task at hand.
                </p>
              </div>
              <div className="w-full md:w-[400px] h-[240px] bg-slate-800/30 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                 <Activity size={80} className="text-emerald-500/20" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Section: About Us (Philosophy) ───────────────────────────── */}
        <section id="about" className="min-h-screen py-32 px-6 bg-slate-950/50 backdrop-blur-sm snap-start relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <span className="text-sky-400 font-bold uppercase tracking-[0.4em] text-[10px] block mb-8">The Philosophy</span>
              <h2 className="text-5xl md:text-8xl font-black text-white mb-16 tracking-tighter leading-[0.9]">
                Reclaim your digital <span className="text-slate-800">sovereignty.</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Modern browsers are built to keep you scrolling. TabMind is built to keep you thinking. 
                    We believe that every tab opened is a commitment of focus — a commitment we help you honor.
                  </p>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    By bridging the gap between automated systems and human intent, we're cooking something enormous: 
                    A browser experience that actually respects your time.
                  </p>
                </div>
                <div className="flex flex-col justify-end">
                   <p className="font-['Caveat'] text-4xl text-sky-400/80 leading-snug mb-4">
                    "We don't need faster browsers. We need more conscious ones."
                   </p>
                   <p className="text-slate-600 uppercase tracking-widest text-[9px] font-bold">— TabMind Core Team</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Background Decorative Element for "Huge" feel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* ── Footer-ish ── */}
        <section className="py-20 text-center border-t border-white/5 opacity-40">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest">© 2026 TabMind</p>
        </section>
      </div>

      {/* ── Google Fonts & Keyframes ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Playfair+Display:ital,wght@0,700;1,700&family=Outfit:wght@600&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes badge-pulse {
          0%, 100% { border-color: rgba(14,165,233,0.3); box-shadow: none; }
          50% { border-color: rgba(14,165,233,0.55); box-shadow: 0 0 20px rgba(14,165,233,0.15); }
        }
      `}</style>
    </div>
  );
};

export default Login;
