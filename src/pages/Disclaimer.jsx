import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Disclaimer() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Disclaimer
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
              Seanna is a productivity and self-organization tool. It is not a medical device and does not provide medical advice, diagnosis, or treatment.
            </p>
            <p>
              If you feel unwell, distressed, or unsafe, seek help from a qualified professional or contact local emergency services.
            </p>
            <p>
              Do not rely on Seanna for urgent situations.
            </p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}