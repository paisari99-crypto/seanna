import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Habits() {
  return (
    <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
      <h1 className="text-3xl font-semibold" style={{ color: '#E8EAF0' }}>
        Habits
      </h1>
      <p className="mt-4" style={{ color: '#9AA3B2' }}>
        Habits screen placeholder
      </p>
      
      <BottomNav />
    </div>
  );
}