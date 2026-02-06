import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

export default function Onboarding() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const currentUser = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      
      if (userProfiles.length > 0) {
        await base44.entities.UserProfile.update(userProfiles[0].id, {
          displayName: displayName.trim()
        });
      } else {
        await base44.entities.UserProfile.create({
          displayName: displayName.trim()
        });
      }

      navigate(createPageUrl('Home'));
    } catch (err) {
      console.error('Error saving display name:', err);
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0F1115' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Welcome to Seanna
          </h1>
          <p className="text-base" style={{ color: '#9AA3B2' }}>
            Set up your workspace in 10 seconds.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#9AA3B2' }}>
              Display name
            </label>
            <Input
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleContinue();
                }
              }}
              autoFocus
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#ff6b6b' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleContinue}
            disabled={saving}
            className="w-full py-3 font-semibold"
            style={{
              backgroundColor: '#C9A227',
              color: '#0F1115',
              borderRadius: '18px',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}