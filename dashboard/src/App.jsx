import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Graveyard from './pages/Graveyard';
import Sessions from './pages/Sessions';
import Analytics from './pages/Analytics';
import Digest from './pages/Digest';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Component to handle the OAuth redirect back from backend
const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Save token and update auth state
      setUser(null, token);
      
      // Fetch user profile and redirect to dashboard
      fetchProfile()
        .then(() => {
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, setUser, fetchProfile, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-text-primary">
      <div className="w-12 h-12 border-4 border-[var(--purple-500)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-display text-lg animate-pulse">Establishing your digital brain... 🧠</p>
    </div>
  );
};

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = localStorage.getItem('token');
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark-toast',
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--bg-surface)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'var(--bg-surface)',
            },
          },
        }} 
      />
      <ErrorBoundary>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Dashboard Routes wrapped in Layout */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/graveyard" element={<ProtectedRoute><Graveyard /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/digest" element={<ProtectedRoute><Digest /></ProtectedRoute>} />

        {/* Root Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;

