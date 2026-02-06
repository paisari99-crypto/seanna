import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export default function JournalNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [moodScore, setMoodScore] = useState([5]);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!body.trim()) {
      setError('Body is required');
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

      const tagsArray = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      await base44.entities.JournalEntry.create({
        userId,
        title: title.trim() || undefined,
        body: body.trim(),
        moodScore: moodScore[0],
        tags: tagsArray
      });

      navigate(createPageUrl('Journal'));
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(createPageUrl('Journal'));
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
          New entry
        </h1>

        <div className="space-y-6">
          <div>
            <Input
              placeholder="Optional title"
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
              placeholder="Write your thoughts…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
          </div>

          <div>
            <label className="text-sm mb-3 block" style={{ color: '#9AA3B2' }}>
              Mood (optional): {moodScore[0]}
            </label>
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="e.g. work, family, focus"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{
                backgroundColor: '#1A1D24',
                borderColor: '#1A1D24',
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#9AA3B2' }}>
              Separate tags with commas
            </p>
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