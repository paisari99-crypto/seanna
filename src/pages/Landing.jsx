import { Link } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { Zap, Target, BookOpen, GitBranch, TrendingUp, Shield, Check, ChevronRight } from 'lucide-react';

export default function Landing() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/app');
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
      <TopNav />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Build better systems,
            <br />
            <span style={{ color: 'var(--primary)' }}>not just habits</span>
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Seanna helps you track habits, journal decisions, and gain AI-powered insights
            to build sustainable personal systems.
          </p>
          <div className="flex gap-4 justify-center">
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
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 text-lg font-semibold rounded-full hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-12 px-4" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
            TRUSTED BY GOAL-ORIENTED INDIVIDUALS
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>10k+</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>1M+</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Habits Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>95%</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to succeed
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Powerful tools to help you build and maintain personal systems
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Habit Tracking',
                description: 'Build sustainable routines with smart habit tracking and streak monitoring.'
              },
              {
                icon: BookOpen,
                title: 'Daily Journal',
                description: 'Reflect and grow with AI-powered insights from your journal entries.'
              },
              {
                icon: GitBranch,
                title: 'Decision Making',
                description: 'Make better choices with structured decision frameworks and scoring.'
              },
              {
                icon: TrendingUp,
                title: 'Weekly Insights',
                description: 'Get personalized AI analysis of your progress and patterns.'
              },
              {
                icon: Shield,
                title: 'Backup & Import',
                description: 'Your data is yours. Export and import anytime, anywhere.'
              },
              {
                icon: Zap,
                title: 'Daily Reviews',
                description: 'End each day with focused reflection and planning for tomorrow.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl hover:scale-105 transition-transform"
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
      <footer className="py-12 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={24} style={{ color: 'var(--primary)' }} />
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Seanna
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Build better systems, not just habits.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" style={{ color: 'var(--text-secondary)' }}>Features</Link></li>
                <li><Link to="/pricing" style={{ color: 'var(--text-secondary)' }}>Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Contact</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                support@seanna.app
              </p>
            </div>
          </div>
          
          <div className="pt-8 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            © 2026 Seanna. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}