import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Journal() {
  return (
    <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
      <h1 className="text-3xl font-semibold" style={{ color: '#E8EAF0' }}>
        Journal
      </h1>
      <p className="mt-4" style={{ color: '#9AA3B2' }}>
        Journal screen placeholder
      </p>
      
      <BottomNav />
    </div>
  );
}