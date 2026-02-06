import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Target, GitBranch, TrendingUp } from 'lucide-react';

export default function Home() {
  const cards = [
    {
      id: 'journal',
      title: 'Journal',
      description: 'Capture thoughts and patterns',
      icon: BookOpen,
      page: 'Journal'
    },
    {
      id: 'habits',
      title: 'Habits',
      description: 'Build systems, not streaks',
      icon: Target,
      page: 'Habits'
    },
    {
      id: 'decisions',
      title: 'Decisions',
      description: 'Compare options with clarity',
      icon: GitBranch,
      page: 'Decisions'
    },
    {
      id: 'insights',
      title: 'Insights',
      description: 'See trends across your tools',
      icon: TrendingUp,
      page: 'Insights'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1115' }}>
      <div style={{ paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '24px' }}>
        <h1 className="text-4xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
          Seanna
        </h1>
        <p className="text-lg" style={{ color: '#9AA3B2' }}>
          Your cognitive toolkit
        </p>
      </div>

      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={createPageUrl(card.page)}
                className="block transition-transform hover:scale-105"
              >
                <div
                  className="p-4 shadow-lg"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <Icon size={32} className="mb-3" style={{ color: '#C9A227' }} />
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#E8EAF0' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#9AA3B2' }}>
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}