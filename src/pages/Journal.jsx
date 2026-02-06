import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { format } from 'date-fns';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const userProfile = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfile[0]?.id;
        
        if (userId) {
          const journalEntries = await base44.entities.JournalEntry.filter(
            { userId },
            '-created_date'
          );
          setEntries(journalEntries);
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const truncateBody = (body) => {
    if (!body) return '';
    return body.length > 120 ? body.substring(0, 120) + '...' : body;
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
              Journal
            </h1>
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              Write clearly. Review patterns.
            </p>
          </div>
          <Link
            to={createPageUrl('JournalNew')}
            className="px-4 py-2 flex items-center gap-2"
            style={{
              backgroundColor: '#C9A227',
              color: '#0F1115',
              borderRadius: '18px',
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            New
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No entries yet. Tap New to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                to={`${createPageUrl('JournalDetail')}?id=${entry.id}`}
                className="block"
              >
                <div
                  className="p-4 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#E8EAF0' }}>
                    {entry.title || 'Untitled'}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: '#9AA3B2' }}>
                    {format(new Date(entry.created_date), 'MMM d, yyyy • h:mm a')}
                  </p>
                  {entry.body && (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      {truncateBody(entry.body)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}