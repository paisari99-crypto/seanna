import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Privacy() {
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
            Privacy
          </h1>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px'
          }}
        >
          <div className="space-y-6 text-base leading-relaxed" style={{ color: '#E8EAF0' }}>
            <p>
              Seanna stores your content to provide core features like syncing and analytics.
            </p>

            <div>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#C9A227' }}>
                Your data
              </h2>
              <div className="space-y-2">
                <p>You can request an export of your data in Settings.</p>
                <p>You can request deletion of your data in Settings.</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#C9A227' }}>
                Security
              </h2>
              <p>
                We use access controls to protect your information. Avoid sharing sensitive details you would not want stored online.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#C9A227' }}>
                Contact
              </h2>
              <p>
                If you need support, include a contact method for your project (email or form) here.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}