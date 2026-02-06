import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HabitNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState('daily');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
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

      await base44.entities.Habit.create({
        userId,
        name: name.trim(),
        description: description.trim() || undefined,
        scheduleType,
        isActive: true
      });

      navigate(createPageUrl('Habits'));
    } catch (err) {
      console.error('Error saving habit:', err);
      setError('Failed to save habit');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(createPageUrl('Habits'));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#E8EAF0' }}>
          New habit
        </h1>

        <div className="space-y-6">
          <div>
            <Input
              placeholder="e.g. 10 min walk"
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
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: '#9AA3B2' }}>
              Schedule
            </label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger
                style={{
                  backgroundColor: '#1A1D24',
                  borderColor: '#1A1D24',
                  color: '#E8EAF0',
                  borderRadius: '18px'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: '#1A1D24',
                  borderColor: '#1A1D24'
                }}
              >
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
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