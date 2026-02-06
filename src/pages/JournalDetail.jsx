import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Trash2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2"
            style={{ color: '#9AA3B2' }}
          >
            <Trash2 size={20} />
          </button>
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
      
      <BottomNav />
    </div>
  );
}