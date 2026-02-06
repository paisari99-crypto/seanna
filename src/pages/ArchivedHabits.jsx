import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
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

export default function ArchivedHabits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfile = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfile[0]?.id;
        
        if (userId) {
          const archivedHabits = await base44.entities.Habit.filter(
            { userId, isActive: false },
            '-created_date'
          );
          setHabits(archivedHabits);
        }
      } catch (error) {
        console.error('Error loading archived habits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getScheduleLabel = (type) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      custom: 'Custom'
    };
    return labels[type] || type;
  };

  const truncateDescription = (desc) => {
    if (!desc) return '';
    return desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
  };

  const handleRestore = async (habitId) => {
    try {
      await base44.entities.Habit.update(habitId, { isActive: true });
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error restoring habit:', error);
    }
  };

  const handleDeleteClick = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;
    
    setDeleting(true);
    try {
      // Delete all related habit logs
      const logs = await base44.entities.HabitLog.filter({ habitId: habitToDelete.id });
      for (const log of logs) {
        await base44.entities.HabitLog.delete(log.id);
      }
      
      // Delete the habit
      await base44.entities.Habit.delete(habitToDelete.id);
      
      // Remove from list
      setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
      setShowDeleteDialog(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setDeleting(false);
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
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Archived Habits
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            Your archived habits are here.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No archived habits yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-4"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px'
                }}
              >
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: '#E8EAF0' }}>
                      {habit.name}
                    </h3>
                    <span
                      className="px-2 py-1 text-xs ml-2"
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#C9A227',
                        borderRadius: '12px'
                      }}
                    >
                      {getScheduleLabel(habit.scheduleType)}
                    </span>
                  </div>
                  {habit.description && (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      {truncateDescription(habit.description)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(habit.id)}
                    className="flex-1 py-2 font-semibold"
                    style={{
                      backgroundColor: '#C9A227',
                      color: '#0F1115',
                      borderRadius: '18px'
                    }}
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteClick(habit)}
                    className="flex-1 py-2 font-semibold"
                    style={{
                      backgroundColor: '#0F1115',
                      color: '#E8EAF0',
                      borderRadius: '18px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>
              Permanently delete this habit?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This will permanently delete this habit and all its logs. This action cannot be undone.
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
              onClick={handleDeleteConfirm}
              disabled={deleting}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              {deleting ? 'Deleting...' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNav />
    </div>
  );
}