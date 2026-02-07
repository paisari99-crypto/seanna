import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ArrowLeft, Moon } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
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

const BUILD_TIMESTAMP = new Date().toISOString();

export default function Settings() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [savingQuietHours, setSavingQuietHours] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        
        if (userProfiles.length > 0) {
          const profile = userProfiles[0];
          setUserProfile(profile);
          setQuietHoursEnabled(profile.quietHoursEnabled || false);
          setQuietHoursStart(profile.quietHoursStart || '22:00');
          setQuietHoursEnd(profile.quietHoursEnd || '08:00');
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

  const handleQuietHoursToggle = async (checked) => {
    setSavingQuietHours(true);
    try {
      setQuietHoursEnabled(checked);
      await base44.entities.UserProfile.update(userProfile.id, { 
        quietHoursEnabled: checked,
        quietHoursStart,
        quietHoursEnd
      });
      toast.success(checked ? 'Quiet hours enabled' : 'Quiet hours disabled');
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      toast.error('Failed to update');
    } finally {
      setSavingQuietHours(false);
    }
  };

  const handleQuietHoursTimeChange = async (field, value) => {
    if (!value) return;
    
    setSavingQuietHours(true);
    try {
      if (field === 'start') {
        setQuietHoursStart(value);
        await base44.entities.UserProfile.update(userProfile.id, { 
          quietHoursStart: value,
          quietHoursEnabled,
          quietHoursEnd
        });
      } else {
        setQuietHoursEnd(value);
        await base44.entities.UserProfile.update(userProfile.id, { 
          quietHoursEnd: value,
          quietHoursEnabled,
          quietHoursStart
        });
      }
      toast.success('Quiet hours updated');
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      toast.error('Failed to update');
    } finally {
      setSavingQuietHours(false);
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

            {/* Quiet Hours */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Moon size={18} style={{ color: '#C9A227' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>
                  Quiet hours
                </h2>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="quiet-hours-toggle" style={{ color: '#E8EAF0' }}>
                  Enable quiet hours
                </Label>
                <Switch
                  id="quiet-hours-toggle"
                  checked={quietHoursEnabled}
                  onCheckedChange={handleQuietHoursToggle}
                  disabled={savingQuietHours}
                />
              </div>
              
              {quietHoursEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="quiet-start" className="text-sm mb-2 block" style={{ color: '#9AA3B2' }}>
                      Start time
                    </Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                      disabled={savingQuietHours}
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#E8EAF0',
                        border: '1px solid #2A2F3A',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quiet-end" className="text-sm mb-2 block" style={{ color: '#9AA3B2' }}>
                      End time
                    </Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                      disabled={savingQuietHours}
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#E8EAF0',
                        border: '1px solid #2A2F3A',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  
                  <p className="text-xs" style={{ color: '#9AA3B2' }}>
                    Reminders will not be sent during quiet hours
                  </p>
                </div>
              )}
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

            {/* Card 4: Information */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Information
              </h2>
              <div className="space-y-2">
                <Link
                  to={createPageUrl('About')}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(202, 162, 39, 0.1)' }}
                >
                  <span style={{ color: '#E8EAF0' }}>About Seanna</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
                <Link
                  to={createPageUrl('Privacy')}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(202, 162, 39, 0.1)' }}
                >
                  <span style={{ color: '#E8EAF0' }}>Privacy</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
                <Link
                  to={createPageUrl('Disclaimer')}
                  className="flex items-center justify-between py-3"
                >
                  <span style={{ color: '#E8EAF0' }}>Disclaimer</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
              </div>
            </div>

            {/* Card 5: Developer */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Developer
              </h2>
              <button
                onClick={() => base44.auth.logout()}
                className="w-full py-3 font-semibold"
                style={{
                  backgroundColor: '#C9A227',
                  color: '#0F1115',
                  borderRadius: '18px'
                }}
              >
                Logout
              </button>
            </div>

            {/* Diagnostic Info */}
            <div className="mt-8 pt-4 space-y-1 text-center">
              <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.6 }}>
                Build: {BUILD_TIMESTAMP}
              </p>
              <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.6 }}>
                Workspace: {currentUser?.email || userProfile?.displayName || 'Unknown'}
              </p>
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