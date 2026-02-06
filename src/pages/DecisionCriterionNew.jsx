import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';

export default function DecisionCriterionNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Weight must be a positive number');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const decisionId = urlParams.get('decisionId');
      
      if (!decisionId) {
        navigate(createPageUrl('Decisions'));
        return;
      }

      const currentUser = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      
      let userId;
      if (userProfiles.length > 0) {
        userId = userProfiles[0].id;
      } else {
        const newProfile = await base44.entities.UserProfile.create({});
        userId = newProfile.id;
      }

      await base44.entities.DecisionCriterion.create({
        decisionId,
        userId,
        name: name.trim(),
        weight: weightNum
      });

      navigate(`${createPageUrl('DecisionDetail')}?id=${decisionId}`);
    } catch (err) {
      console.error('Error creating criterion:', err);
      setError('Failed to create criterion');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const decisionId = urlParams.get('decisionId');
    if (decisionId) {
      navigate(`${createPageUrl('DecisionDetail')}?id=${decisionId}`);
    } else {
      navigate(createPageUrl('Decisions'));
    }
  };

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
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#E8EAF0' }}>
          New criterion
        </h1>

        <div className="space-y-6">
          <div>
            <Input
              placeholder="Criterion name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#9AA3B2' }}>
              Weight
            </label>
            <Input
              type="number"
              placeholder="1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              min="0.1"
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
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 font-semibold"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save'}
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