import React from 'react';

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`p-4 animate-pulse ${className}`}
      style={{
        backgroundColor: '#1A1D24',
        borderRadius: '18px'
      }}
    >
      <div className="h-4 w-3/4 mb-3" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
      <div className="h-3 w-1/2 mb-2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
      <div className="h-3 w-2/3" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div
      className="p-3 animate-pulse"
      style={{
        backgroundColor: 'rgba(26, 29, 36, 0.4)',
        borderRadius: '18px'
      }}
    >
      <div className="h-3 w-2/3 mb-2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
      <div className="h-3 w-1/2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
    </div>
  );
}

export function SkeletonInsightCard() {
  return (
    <div
      className="p-4 animate-pulse"
      style={{
        backgroundColor: '#0F1115',
        borderRadius: '12px'
      }}
    >
      <div className="h-3 w-1/3 mb-2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
      <div className="h-4 w-3/4 mb-2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
      <div className="h-3 w-1/2" style={{ backgroundColor: '#2A2F3A', borderRadius: '8px' }} />
    </div>
  );
}