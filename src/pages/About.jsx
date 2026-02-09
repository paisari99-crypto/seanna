import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, BookOpen, GitBranch, TrendingUp, Shield } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--background)',
        background: 'radial-gradient(ellipse at top, rgba(201, 162, 39, 0.08) 0%, var(--background) 50%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-8 p-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={32} style={{ color: 'var(--primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              About Seanna
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Your personal cognitive toolkit
          </p>
        </div>

        <div
          className="p-8 mb-8 rounded-2xl"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="space-y-6 text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            <p>
              Seanna is a personal cognitive toolkit designed to help you think clearly, plan effectively, and track your personal systems.
            </p>
            <p>
              Unlike traditional habit trackers, Seanna focuses on building sustainable systems through integrated tools for journaling, habit architecture, decision scoring, and AI-powered insights.
            </p>
            <p>
              Seanna is built to be calm, minimal, and practical — so you can focus on what matters without distraction.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Core Modules
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Target,
                title: 'Habits',
                description: 'Track daily systems with smart scheduling, streaks, and reminders.'
              },
              {
                icon: BookOpen,
                title: 'Journal',
                description: 'Capture thoughts with optional AI summaries and key insights.'
              },
              {
                icon: GitBranch,
                title: 'Decisions',
                description: 'Score options against weighted criteria for better choices.'
              },
              {
                icon: TrendingUp,
                title: 'Insights',
                description: 'Get weekly AI reviews and analytics on your progress.'
              },
              {
                icon: Shield,
                title: 'Data Control',
                description: 'Full backup and import capabilities — your data stays yours.'
              }
            ].map((module, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <module.icon size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {module.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}