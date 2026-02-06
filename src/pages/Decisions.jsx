import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { format } from 'date-fns';

export default function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfile = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfile[0]?.id;
        
        if (userId) {
          const userDecisions = await base44.entities.Decision.filter(
            { userId },
            '-created_date'
          );
          setDecisions(userDecisions);
        }
      } catch (error) {
        console.error('Error loading decisions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const truncateContext = (context) => {
    if (!context) return '';
    return context.length > 80 ? context.substring(0, 80) + '...' : context;
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
              Decisions
            </h1>
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              Compare clearly. Commit calmly.
            </p>
          </div>
          <Link
            to={createPageUrl('DecisionNew')}
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
        ) : decisions.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No decisions yet. Tap New to start one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <Link
                key={decision.id}
                to={`${createPageUrl('DecisionDetail')}?id=${decision.id}`}
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
                    {decision.title}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: '#9AA3B2' }}>
                    {format(new Date(decision.created_date), 'MMM d, yyyy • h:mm a')}
                  </p>
                  {decision.context && (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      {truncateContext(decision.context)}
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