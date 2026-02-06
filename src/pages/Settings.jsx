import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
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

export default function Settings() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        
        if (userProfiles.length > 0) {
          setUserProfile(userProfiles[0]);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleExportRequest = async () => {
    setExporting(true);
    try {
      await base44.entities.DataExportJob.create({
        userId: userProfile.id,
        status: 'queued'
      });
      setExportMessage("Export requested. You'll receive a download link here when ready.");
    } catch (error) {
      console.error('Error requesting export:', error);
      setExportMessage('Failed to request export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRequest = async () => {
    setDeleting(true);
    try {
      await base44.entities.DeletionRequest.create({
        userId: userProfile.id,
        status: 'requested'
      });
      setDeleteMessage('Deletion request submitted successfully.');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error requesting deletion:', error);
      setDeleteMessage('Failed to request deletion. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            Manage your account and data.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : (
          <div className="space-y-4">
            {/* Card 1: Account */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Account
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                    Display Name
                  </p>
                  <p className="text-base" style={{ color: '#E8EAF0' }}>
                    {userProfile?.displayName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                    Plan
                  </p>
                  <span
                    className="inline-block px-3 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: userProfile?.planTier === 'premium' ? '#C9A227' : '#0F1115',
                      color: userProfile?.planTier === 'premium' ? '#0F1115' : '#C9A227',
                      borderRadius: '12px'
                    }}
                  >
                    {userProfile?.planTier === 'premium' ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Export my data */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Export my data
              </h2>
              <button
                onClick={handleExportRequest}
                disabled={exporting}
                className="w-full py-3 mb-3 font-semibold"
                style={{
                  backgroundColor: '#C9A227',
                  color: '#0F1115',
                  borderRadius: '18px',
                  opacity: exporting ? 0.5 : 1
                }}
              >
                {exporting ? 'Requesting...' : 'Request Export'}
              </button>
              {exportMessage && (
                <p className="text-sm" style={{ color: '#9AA3B2' }}>
                  {exportMessage}
                </p>
              )}
            </div>

            {/* Card 3: Delete my data */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Delete my data
              </h2>
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="w-full py-3 mb-3 font-semibold"
                style={{
                  backgroundColor: '#C9A227',
                  color: '#0F1115',
                  borderRadius: '18px',
                  opacity: deleting ? 0.5 : 1
                }}
              >
                Request Deletion
              </button>
              {deleteMessage && (
                <p className="text-sm" style={{ color: '#9AA3B2' }}>
                  {deleteMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>Delete your data?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This will permanently delete your data. Continue?
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
              onClick={handleDeleteRequest}
              disabled={deleting}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              {deleting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}