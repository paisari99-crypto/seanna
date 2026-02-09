import TopNav from '@/components/TopNav';
import { Link } from 'react-router-dom';
import { Target, BookOpen, GitBranch, TrendingUp, Shield, Zap, Check } from 'lucide-react';

export default function Features() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <TopNav />
      
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              All the features you need
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Everything to build and maintain sustainable personal systems
            </p>
          </div>
          
          <div className="space-y-20">
            {[
              {
                icon: Target,
                title: 'Smart Habit Tracking',
                description: 'Build sustainable routines with intelligent habit tracking. Track daily, weekly, or custom schedules.',
                features: [
                  'Flexible scheduling (daily, weekly, custom)',
                  'Streak tracking and milestones',
                  'Quick-log from home dashboard',
                  'Archive completed habits',
                  'Reminder notifications'
                ]
              },
              {
                icon: BookOpen,
                title: 'Daily Journal',
                description: 'Reflect on your day and track your thoughts with a powerful journaling system.',
                features: [
                  'Rich text journaling',
                  'Mood tracking (1-10 scale)',
                  'AI-generated summaries (Pro)',
                  'Tag-based organization',
                  'Full search and filtering'
                ]
              },
              {
                icon: GitBranch,
                title: 'Decision Framework',
                description: 'Make better decisions with structured frameworks and weighted scoring.',
                features: [
                  'Multi-criteria decision analysis',
                  'Weighted scoring system',
                  'AI risk assessment (Pro)',
                  'Decision history tracking',
                  'Export decision reports'
                ]
              },
              {
                icon: TrendingUp,
                title: 'Weekly Insights',
                description: 'Get AI-powered analysis of your progress and patterns (Pro feature).',
                features: [
                  'Personalized weekly reviews',
                  'Pattern recognition',
                  'Actionable recommendations',
                  'Progress visualization',
                  'Trend analysis'
                ]
              },
              {
                icon: Zap,
                title: 'Daily Reviews',
                description: 'End each day with focused reflection and planning for tomorrow.',
                features: [
                  'Structured daily reflection',
                  'What worked/what was difficult',
                  'Tomorrow focus planning',
                  'Daily habit summary snapshot',
                  'Review history tracking'
                ]
              },
              {
                icon: Shield,
                title: 'Data Ownership',
                description: 'Your data is yours. Export, import, and backup anytime.',
                features: [
                  'Full JSON export',
                  'Import from backups',
                  'Duplicate detection',
                  'Data integrity checks',
                  'GDPR-compliant deletion'
                ]
              }
            ].map((feature, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-12 items-center">
                <div className={idx % 2 === 0 ? '' : 'md:order-2'}>
                  <feature.icon size={48} style={{ color: 'var(--primary)', marginBottom: '24px' }} />
                  <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h2>
                  <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <Check size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div 
                  className={`aspect-video rounded-2xl flex items-center justify-center ${idx % 2 === 0 ? '' : 'md:order-1'}`}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p style={{ color: 'var(--text-secondary)' }}>{feature.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <button
              onClick={() => base44.auth.redirectToLogin('/app')}
              className="px-8 py-4 text-lg font-semibold rounded-full"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}