import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, BookOpen, GitBranch, TrendingUp, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

export default function Demo() {
  const [habits, setHabits] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  
  useEffect(() => {
    // HARD RESET on every entry
    sessionStorage.removeItem('seanna_demo_state');
    sessionStorage.removeItem('seanna_demo_seen');
    
    // Initialize static demo data in memory
    setHabits([
      { id: '1', name: 'Morning meditation', completed: false },
      { id: '2', name: 'Exercise', completed: true },
      { id: '3', name: 'Read for 30 min', completed: false }
    ]);
    
    setJournalEntries([
      { id: '1', title: 'Example Entry', date: '2026-02-14', preview: 'This is a demo journal entry...' }
    ]);
  }, []);
  
  const toggleHabit = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };
  
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <meta name="robots" content="noindex,nofollow" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4" style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)' }}>
            DEMO MODE
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Seanna Demo
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            Explore the interface with sample data
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No AI • No data saved • Resets on every visit
          </p>
        </div>
        
        {/* Dashboard Summary */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface)' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Today's Progress
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                {habits.filter(h => h.completed).length}/{habits.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Habits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                5
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                12
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Entries</div>
            </div>
          </div>
        </div>
        
        {/* Habits Demo */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} style={{ color: 'var(--primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Habits
            </h2>
          </div>
          <div className="space-y-3">
            {habits.map(habit => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--background)' }}
              >
                {habit.completed ? (
                  <CheckCircle2 size={24} style={{ color: 'var(--primary)' }} />
                ) : (
                  <Circle size={24} style={{ color: 'var(--text-secondary)' }} />
                )}
                <span 
                  className={habit.completed ? 'line-through' : ''}
                  style={{ color: habit.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                >
                  {habit.name}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            ℹ️ Click to toggle completion (demo only - not saved)
          </p>
        </div>
        
        {/* Journal Demo */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={24} style={{ color: 'var(--primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Journal
            </h2>
          </div>
          <div className="space-y-3">
            {journalEntries.map(entry => (
              <div
                key={entry.id}
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {entry.title}
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {entry.date}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {entry.preview}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            ℹ️ In the full app, you can create journal entries with AI summaries
          </p>
        </div>
        
        {/* Insights Demo */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Example Insights
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                📈 Weekly Pattern
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You complete more habits on weekdays. Consider setting easier goals for weekends.
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                🔥 Streak Analysis
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your best habit is "Exercise" with a 12-day streak. Keep it up!
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            ℹ️ In the full app, insights are generated based on your actual data
          </p>
        </div>
        
        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
            Ready to start tracking your own progress?
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-full hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            Sign Up Free
          </Link>
        </div>
        
        {/* Footer Links */}
        <div className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy</Link>
            <Link to="/disclaimer" style={{ color: 'var(--text-secondary)' }}>Disclaimer</Link>
            <Link to="/about" style={{ color: 'var(--text-secondary)' }}>About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}