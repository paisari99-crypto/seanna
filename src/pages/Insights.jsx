import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BottomNav from '../components/BottomNav';

export default function Insights() {
  const [metrics, setMetrics] = useState({
    journalLast7: 0,
    journalLast30: 0,
    habitLogsLast7: 0,
    habitDoneRate: 0,
    decisionsLast30: 0,
    decisionsWithScoring: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfiles[0]?.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Journal metrics
        const allJournalEntries = await base44.entities.JournalEntry.filter({ userId });
        const journalLast7 = allJournalEntries.filter(e => new Date(e.created_date) >= sevenDaysAgo).length;
        const journalLast30 = allJournalEntries.filter(e => new Date(e.created_date) >= thirtyDaysAgo).length;

        // Habit metrics
        const allHabitLogs = await base44.entities.HabitLog.filter({ userId });
        const logsLast7 = allHabitLogs.filter(l => new Date(l.created_date) >= sevenDaysAgo);
        const habitLogsLast7 = logsLast7.length;
        
        const doneCount = logsLast7.filter(l => l.status === 'done').length;
        const totalTracked = logsLast7.filter(l => ['done', 'skipped', 'missed'].includes(l.status)).length;
        const habitDoneRate = totalTracked > 0 ? Math.round((doneCount / totalTracked) * 100) : 0;

        // Decision metrics
        const allDecisions = await base44.entities.Decision.filter({ userId });
        const decisionsLast30 = allDecisions.filter(d => new Date(d.created_date) >= thirtyDaysAgo).length;

        const allScores = await base44.entities.DecisionScore.filter({ userId });
        const decisionsWithScoring = new Set(allScores.map(s => s.decisionId)).size;

        setMetrics({
          journalLast7,
          journalLast30,
          habitLogsLast7,
          habitDoneRate,
          decisionsLast30,
          decisionsWithScoring
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Insights
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            Track your progress.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : (
          <div className="space-y-4">
            {/* Card 1: Journal cadence */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Journal cadence
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Entries last 7 days
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.journalLast7}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Entries last 30 days
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.journalLast30}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Habit consistency */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Habit consistency
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Habit logs last 7 days
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.habitLogsLast7}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Done rate (7 days)
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.habitDoneRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Decision activity */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Decision activity
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Decisions created last 30 days
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.decisionsLast30}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#9AA3B2' }}>
                    Decisions with scoring started
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>
                    {metrics.decisionsWithScoring}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}