import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function GuidanceCard({ habitCount, hasLoggedToday, justCompleted, developerPreview }) {
  const navigate = useNavigate();

  // Priority 1: Habit completed today → success card
  if (hasLoggedToday) {
    const CardWrapper = justCompleted ? motion.div : 'div';
    const animationProps = justCompleted ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    } : {};

    return (
      <CardWrapper
        className="p-6 mb-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '18px',
          border: '2px solid var(--border)'
        }}
        {...animationProps}
      >
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          System active
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          You completed progress today.
        </p>
        <button
          onClick={() => navigate(createPageUrl('Insights'))}
          className="px-4 py-2 font-semibold"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '18px'
          }}
        >
          View insights
        </button>
      </CardWrapper>
    );
  }

  // Priority 2: No habits → onboarding card
  if (!developerPreview && habitCount > 0) {
    return null;
  }

  // Priority 3: Habit exists but not logged → mark progress card
  return (
    <div
      className="p-6 mb-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '18px',
        border: '2px solid var(--border)'
      }}
    >
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Start your first system
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Build one small habit to see how Seanna works.
      </p>
      <button
        onClick={() => navigate(`${createPageUrl('HabitNew')}?onboarding=true`)}
        className="px-4 py-2 font-semibold"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderRadius: '18px'
        }}
      >
        Create first habit
      </button>
    </div>
  );
}