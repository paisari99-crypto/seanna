import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, Target, GitBranch, TrendingUp } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, page: 'App' },
    { id: 'journal', label: 'Journal', icon: BookOpen, page: 'Journal' },
    { id: 'habits', label: 'Habits', icon: Target, page: 'Habits' },
    { id: 'decisions', label: 'Decisions', icon: GitBranch, page: 'Decisions' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, page: 'Insights' }
  ];
  
  const isActive = (page) => {
    return location.pathname === createPageUrl(page) || location.pathname === `/${page.toLowerCase()}`;
  };
  
  const handleTabClick = (e, page) => {
    e.preventDefault();
    if (isActive(page)) {
      // If already on this tab, navigate to base route
      navigate(createPageUrl(page), { replace: true });
    } else {
      navigate(createPageUrl(page));
    }
  };
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center"
      style={{ 
        backgroundColor: 'var(--surface)', 
        height: '56px',
        paddingBottom: 'var(--safe-area-bottom)',
        borderTop: '1px solid rgba(202, 162, 39, 0.1)',
        zIndex: 50
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.page);
        
        return (
          <button
            key={tab.id}
            onClick={(e) => handleTabClick(e, tab.page)}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <Icon 
              size={20} 
              style={{ color: active ? 'var(--primary)' : 'var(--text-secondary)' }}
            />
            <span 
              className="text-xs mt-1"
              style={{ color: active ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}