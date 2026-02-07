import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error silently
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Store in localStorage for diagnostics
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      };
      localStorage.setItem('seanna_last_error', JSON.stringify(errorLog));
    } catch (e) {
      // Fail silently
    }
    
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: '#0F1115' }}
        >
          <div 
            className="max-w-md w-full p-6 text-center"
            style={{
              backgroundColor: '#1A1D24',
              borderRadius: '18px'
            }}
          >
            <AlertCircle 
              size={48} 
              className="mx-auto mb-4" 
              style={{ color: '#C9A227' }} 
            />
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9AA3B2' }}>
              We've logged the issue. Please refresh to continue.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 font-semibold"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              Refresh app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;