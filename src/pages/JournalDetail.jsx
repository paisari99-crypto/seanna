import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Trash2, Edit, Sparkles, Lock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function JournalDetail() {
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaywallDialog, setShowPaywallDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          navigate(createPageUrl('Journal'));
          return;
        }

        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        if (userProfiles.length > 0) {
          setUserProfile(userProfiles[0]);
        }

        const entries = await base44.entities.JournalEntry.filter({ id });
        if (entries.length > 0) {
          setEntry(entries[0]);
        } else {
          navigate(createPageUrl('Journal'));
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntry();
  }, [navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.JournalEntry.delete(entry.id);
      navigate(createPageUrl('Journal'));
    } catch (error) {
      console.error('Error deleting entry:', error);
      setDeleting(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!userProfile || userProfile.planTier !== 'premium') {
      setShowPaywallDialog(true);
      return;
    }

    setGenerating(true);
    try {
      const prompt = `You are an empathetic journal analysis assistant. Analyze the following journal entry and provide insights.

CRITICAL SAFETY RULES:
- If the entry contains self-harm intent or ideation, return ONLY: {"summary": "I'm really sorry you're feeling this way. Please reach out for immediate support.", "key_insights": ["Contact local emergency services or a trusted person now."], "suggested_tags": ["support"]}
- Do not provide medical advice
- Do not mention diagnosis or therapy
- Keep tone calm and supportive

Journal Title: ${entry.title || 'Untitled'}
Journal Body: ${entry.body}

Provide a response in the following JSON format:
{
  "summary": "A brief summary in max 80 words",
  "key_insights": ["First insight", "Second insight", "Third insight"],
  "suggested_tags": ["tag1", "tag2", "tag3"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            suggested_tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      const updateData = {
        aiSummary: response.summary,
        aiKeyInsights: response.key_insights
      };

      if (!entry.tags || entry.tags.length === 0) {
        updateData.tags = response.suggested_tags;
      }

      await base44.entities.JournalEntry.update(entry.id, updateData);
      
      setEntry(prev => ({
        ...prev,
        ...updateData
      }));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
        <p style={{ color: '#9AA3B2' }}>Loading...</p>
        <BottomNav />
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-semibold flex-1" style={{ color: '#E8EAF0' }}>
            {entry.title || 'Untitled'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`${createPageUrl('JournalEdit')}?id=${entry.id}`)}
              className="p-2"
              style={{ color: '#9AA3B2' }}
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2"
              style={{ color: '#9AA3B2' }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            {format(new Date(entry.created_date), 'MMMM d, yyyy • h:mm a')}
          </p>
          
          {entry.moodScore && (
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              Mood: {entry.moodScore}/10
            </p>
          )}
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs"
                  style={{
                    backgroundColor: '#1A1D24',
                    color: '#C9A227',
                    borderRadius: '18px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="p-4"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px'
          }}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#E8EAF0' }}>
            {entry.body}
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={generating}
          className="w-full py-3 mt-4 flex items-center justify-center gap-2 font-semibold"
          style={{
            backgroundColor: userProfile?.planTier === 'premium' ? '#C9A227' : '#1A1D24',
            color: userProfile?.planTier === 'premium' ? '#0F1115' : '#9AA3B2',
            borderRadius: '18px',
            opacity: generating ? 0.5 : 1
          }}
        >
          {userProfile?.planTier === 'premium' ? (
            <>
              <Sparkles size={18} />
              {generating ? 'Generating...' : 'Generate Summary'}
            </>
          ) : (
            <>
              <Lock size={18} />
              Generate Summary (Premium)
            </>
          )}
        </button>

        {entry.aiSummary && (
          <div className="space-y-4 mt-6">
            <div
              className="p-4"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                AI Summary
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#E8EAF0' }}>
                {entry.aiSummary}
              </p>
            </div>

            {entry.aiKeyInsights && entry.aiKeyInsights.length > 0 && (
              <div
                className="p-4"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px'
                }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#C9A227' }}>
                  Key insights
                </h3>
                <ul className="space-y-2">
                  {entry.aiKeyInsights.map((insight, index) => (
                    <li key={index} className="flex gap-2">
                      <span style={{ color: '#C9A227' }}>•</span>
                      <span className="text-sm" style={{ color: '#E8EAF0' }}>
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleting}
              style={{ 
                backgroundColor: '#0F1115', 
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaywallDialog} onOpenChange={setShowPaywallDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>Premium Feature</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              Upgrade to Premium to unlock AI summaries and insights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              style={{ 
                backgroundColor: '#0F1115', 
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNav />
    </div>
  );
}