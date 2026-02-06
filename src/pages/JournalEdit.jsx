import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export default function JournalEdit() {
  const navigate = useNavigate();
  const [entryId, setEntryId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [moodScore, setMoodScore] = useState([5]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          navigate(createPageUrl('Journal'));
          return;
        }

        const entries = await base44.entities.JournalEntry.filter({ id });
        if (entries.length > 0) {
          const entry = entries[0];
          setEntryId(entry.id);
          setTitle(entry.title || '');
          setBody(entry.body || '');
          setMoodScore([entry.moodScore || 5]);
          setTags(entry.tags ? entry.tags.join(', ') : '');
        } else {
          navigate(createPageUrl('Journal'));
        }
      } catch (err) {
        console.error('Error loading entry:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntry();
  }, [navigate]);

  const handleSave = async () => {
    if (!body.trim()) {
      setError('Body is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const tagsArray = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      await base44.entities.JournalEntry.update(entryId, {
        title: title.trim() || undefined,
        body: body.trim(),
        moodScore: moodScore[0],
        tags: tagsArray
      });

      navigate(`${createPageUrl('JournalDetail')}?id=${entryId}`);
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update entry');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`${createPageUrl('JournalDetail')}?id=${entryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
        <p style={{ color: '#9AA3B2' }}>Loading...</p>
        <BottomNav />
      </div>
    );
  }

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
          Edit entry
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
              {saving ? 'Saving...' : 'Save changes'}
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