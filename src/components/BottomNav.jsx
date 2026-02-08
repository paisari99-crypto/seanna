import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, Target, GitBranch, TrendingUp } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, page: 'Home' },
    { id: 'journal', label: 'Journal', icon: BookOpen, page: 'Journal' },
    { id: 'habits', label: 'Habits', icon: Target, page: 'Habits' },
    { id: 'decisions', label: 'Decisions', icon: GitBranch, page: 'Decisions' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, page: 'Insights' }
  ];
  
  const isActive = (page) => {
    return location.pathname === createPageUrl(page) || location.pathname === `/${page.toLowerCase()}`;
  };
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center"
      style={{ 
        backgroundColor: '#1A1D24', 
        height: '56px',
        paddingBottom: 'var(--safe-area-bottom)',
        borderTop: '1px solid rgba(202, 162, 39, 0.1)'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.page);
        
        return (
          <Link
            key={tab.id}
            to={createPageUrl(tab.page)}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <Icon 
              size={20} 
              style={{ color: active ? '#C9A227' : '#9AA3B2' }}
            />
            <span 
              className="text-xs mt-1"
              style={{ color: active ? '#C9A227' : '#9AA3B2' }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}