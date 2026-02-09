import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Zap, Target, BookOpen, GitBranch, TrendingUp, Shield, LogIn } from 'lucide-react';

export default function Landing() {
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
            <Link 
              to="/about" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              About
            </Link>
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

      {/* How It Works */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How it works
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Start building better systems in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Define Your Systems',
                description: 'Create habits and set up your tracking preferences. Start small with one habit.'
              },
              {
                step: '2',
                title: 'Track Daily Progress',
                description: 'Log your habits, journal your thoughts, and review your decisions each day.'
              },
              {
                step: '3',
                title: 'Get AI Insights',
                description: 'Receive personalized weekly insights and recommendations to optimize your systems.'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="demo" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              See Seanna in action
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Simple, powerful, and beautifully designed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {['Dashboard View', 'Habit Tracker', 'Weekly Insights', 'Journal Entry'].map((name, idx) => (
              <div
                key={idx}
                className="aspect-video rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p style={{ color: 'var(--text-secondary)' }}>{name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Simple, transparent pricing
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Start free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect to get started',
                features: [
                  'Unlimited habits',
                  'Daily journal',
                  'Decision tracking',
                  'Basic insights',
                  'Data export'
                ]
              },
              {
                name: 'Pro',
                price: '$9',
                period: '/month',
                description: 'For serious system builders',
                features: [
                  'Everything in Free',
                  'AI weekly insights',
                  'Advanced analytics',
                  'Priority support',
                  'Custom integrations'
                ],
                highlighted: true
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl"
                style={{
                  backgroundColor: plan.highlighted ? 'var(--background)' : 'var(--background)',
                  border: plan.highlighted ? '2px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold" style={{ color: 'var(--primary)' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <Check size={20} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-full font-semibold"
                  style={{
                    backgroundColor: plan.highlighted ? 'var(--primary)' : 'var(--surface)',
                    color: plan.highlighted ? 'var(--primary-foreground)' : 'var(--text-primary)',
                    border: plan.highlighted ? 'none' : '1px solid var(--border)'
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: 'Is Seanna really free?',
                a: 'Yes! Our Free plan gives you unlimited habits, daily journaling, and decision tracking. Upgrade to Pro for AI insights and advanced analytics.'
              },
              {
                q: 'Can I export my data?',
                a: 'Absolutely. Your data is yours. You can export all your data anytime in JSON format and import it elsewhere if needed.'
              },
              {
                q: 'How does the AI weekly review work?',
                a: 'Pro users get personalized AI-generated weekly reviews that analyze your habits, journal entries, and decisions to provide actionable insights.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
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
            <Link to="/about" style={{ color: 'var(--text-secondary)' }}>About</Link>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy</Link>
            <Link to="/disclaimer" style={{ color: 'var(--text-secondary)' }}>Disclaimer</Link>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2026 Seanna. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}