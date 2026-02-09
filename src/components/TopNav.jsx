import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function TopNav() {
  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'rgba(15, 17, 21, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(202, 162, 39, 0.1)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap size={24} style={{ color: 'var(--primary)' }} />
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Seanna
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/features" 
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            Pricing
          </Link>
          <button
            onClick={() => base44.auth.redirectToLogin('/app')}
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            Login
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin('/app')}
            className="px-4 py-2 text-sm font-semibold rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}