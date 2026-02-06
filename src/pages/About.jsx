import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function About() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2"
          style={{ color: '#9AA3B2' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            About Seanna
          </h1>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px'
          }}
        >
          <div className="space-y-4 text-base leading-relaxed" style={{ color: '#E8EAF0' }}>
            <p>
              Seanna is a personal cognitive toolkit designed to help you think clearly, plan effectively, and track your personal systems.
            </p>
            <p>
              It includes tools for journaling, habit architecture, decision scoring, and insights.
            </p>
            <p>
              Seanna is built to be calm, minimal, and practical — so you can focus on what matters.
            </p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}