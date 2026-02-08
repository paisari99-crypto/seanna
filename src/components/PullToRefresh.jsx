import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollable = useRef(null);
  const threshold = 80;

  const handleTouchStart = (e) => {
    if (scrollable.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (refreshing || scrollable.current?.scrollTop > 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      ref={scrollable}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        overflowY: 'auto',
        height: '100%',
        position: 'relative'
      }}
    >
      {(pulling || refreshing) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.max(pullDistance, 0)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: refreshing ? 'height 0.2s ease' : 'none',
            backgroundColor: 'transparent',
            zIndex: 10
          }}
        >
          {refreshing ? (
            <Loader2 size={24} className="animate-spin" style={{ color: '#C9A227' }} />
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #C9A227',
                borderTopColor: 'transparent',
                transform: `rotate(${pullDistance * 3}deg)`,
                opacity: Math.min(pullDistance / threshold, 1)
              }}
            />
          )}
        </div>
      )}
      <div style={{ paddingTop: refreshing ? '60px' : '0px', transition: 'padding-top 0.2s ease' }}>
        {children}
      </div>
    </div>
  );
}