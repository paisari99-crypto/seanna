import React from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Target, BookOpen, GitBranch, LogIn } from 'lucide-react';

export default function Home() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/app');
  };

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--text-primary)',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(201, 162, 39, 0.08) 0%, var(--background) 50%)'
      }}
    >
      {/* Top Nav */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'rgba(15, 17, 21, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(202, 162, 39, 0.1)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={28} style={{ color: 'var(--primary)' }} />
            <div>
              <span className="text-xl font-bold block" style={{ color: 'var(--text-primary)' }}>
                Seanna
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Your cognitive toolkit
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="/about" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              About
            </a>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              <LogIn size={16} />
              Login / Sign Up
            </button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                backgroundColor: 'var(--surface)',
                border: '2px solid var(--border)'
              }}
            >
              <Zap size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Seanna — your personal
            <br />
            <span style={{ color: 'var(--primary)' }}>cognitive toolkit</span>
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Track habits, journal your thoughts, score decisions, and gain AI-powered insights.
            <br />
            Everything backed up and exportable — your data, your way.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 text-lg font-semibold rounded-full hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Feature Cards Row */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Habits',
                description: 'Track daily systems with streaks and smart scheduling.'
              },
              {
                icon: BookOpen,
                title: 'Journal',
                description: 'Capture thoughts with AI summaries and key insights.'
              },
              {
                icon: GitBranch,
                title: 'Decisions & Insights',
                description: 'Score options and get weekly AI reviews of your progress.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <feature.icon size={32} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 mt-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap size={24} style={{ color: 'var(--primary)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Seanna
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Your personal cognitive toolkit
          </p>
          <div className="flex justify-center gap-6 text-sm mb-6">
            <a href="/about" style={{ color: 'var(--text-secondary)' }}>About</a>
            <a href="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy</a>
            <a href="/disclaimer" style={{ color: 'var(--text-secondary)' }}>Disclaimer</a>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2026 Seanna. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}