import TopNav from '@/components/TopNav';
import { Check } from 'lucide-react';

export default function Pricing() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/app');
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <TopNav />
      
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Simple, transparent pricing
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
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
                  'Daily journal with mood tracking',
                  'Decision tracking and scoring',
                  'Daily review system',
                  'Basic insights and stats',
                  'Data export (JSON)',
                  'Mobile-responsive design',
                  'Community support'
                ]
              },
              {
                name: 'Pro',
                price: '$9',
                period: '/month',
                description: 'For serious system builders',
                features: [
                  'Everything in Free',
                  'AI weekly insights and analysis',
                  'AI journal summaries',
                  'AI decision risk assessment',
                  'Advanced analytics and charts',
                  'Pattern recognition',
                  'Priority support',
                  'Custom integrations (coming soon)',
                  'Data import from backups'
                ],
                highlighted: true
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: plan.highlighted ? '2px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                {plan.highlighted && (
                  <div 
                    className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-4"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)'
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
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
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <Check size={20} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-primary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-full font-semibold"
                  style={{
                    backgroundColor: plan.highlighted ? 'var(--primary)' : 'transparent',
                    color: plan.highlighted ? 'var(--primary-foreground)' : 'var(--text-primary)',
                    border: plan.highlighted ? 'none' : '1px solid var(--border)'
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h3>
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              {[
                {
                  q: 'Can I switch between plans?',
                  a: 'Yes! You can upgrade to Pro anytime. If you downgrade, you\'ll keep Pro features until the end of your billing period.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards and debit cards through our secure payment processor.'
                },
                {
                  q: 'Is there a refund policy?',
                  a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment, no questions asked.'
                },
                {
                  q: 'What happens to my data if I cancel?',
                  a: 'Your data remains yours forever. You can export it anytime, even after canceling. We\'ll keep your account for 90 days in case you want to come back.'
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
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {faq.q}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}