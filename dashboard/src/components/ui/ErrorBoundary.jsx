import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 text-center bg-bg-base/50 rounded-3xl border border-red-500/20 backdrop-blur-sm">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-2">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-text-primary">Something went wrong</h2>
              <p className="text-text-secondary">
                TabMind encountered an unexpected error while rendering this view. Your data is safe.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/10 text-left overflow-auto max-h-[200px]">
                <code className="text-xs text-red-400 font-mono">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--purple-500)] hover:bg-[var(--purple-600)] text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <RefreshCw size={18} />
                Try Refreshing
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl font-bold border border-white/10 transition-all active:scale-95"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
