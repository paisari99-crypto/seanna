import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function DecisionNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const currentUser = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      
      let userId;
      if (userProfiles.length > 0) {
        userId = userProfiles[0].id;
      } else {
        const newProfile = await base44.entities.UserProfile.create({});
        userId = newProfile.id;
      }

      const newDecision = await base44.entities.Decision.create({
        userId,
        title: title.trim(),
        context: context.trim() || undefined
      });

      navigate(`${createPageUrl('DecisionDetail')}?id=${newDecision.id}`);
    } catch (err) {
      console.error('Error creating decision:', err);
      setError('Failed to create decision');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(createPageUrl('Decisions'));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#E8EAF0' }}>
          New decision
        </h1>

        <div className="space-y-6">
          <div>
            <Input
              placeholder="e.g. Change job?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
          </div>

          <div>
            <Textarea
              placeholder="Key constraints, goals, concerns…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={8}
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

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-3 font-semibold"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 py-3 font-semibold"
              style={{
                backgroundColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}