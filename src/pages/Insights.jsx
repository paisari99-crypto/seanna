import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Lock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import WeeklyPatternCard from '../components/WeeklyPatternCard';
import { getMostConsistentHabit, getMostMissedHabit, getBestWeekday } from '../components/insightUtils';
import { getMostConsistentHabit as getConsistent, getNeedsAttentionHabit, getStrongestDay } from '../components/analyticsUtils';

export default function Insights() {
  const [metrics, setMetrics] = useState({
    journalLast7: 0,
    journalLast30: 0,
    habitLogsLast7: 0,
    habitDoneRate: 0,
    decisionsLast30: 0,
    decisionsWithScoring: 0,
    totalHabitLogs: 0
  });
  const [userProfile, setUserProfile] = useState(null);
  const [weeklyReview, setWeeklyReview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostConsistentHabit, setMostConsistentHabit] = useState(null);
  const [mostMissedHabit, setMostMissedHabit] = useState(null);
  const [bestWeekday, setBestWeekday] = useState(null);
  const [analyticsConsistent, setAnalyticsConsistent] = useState(null);
  const [analyticsNeedsAttention, setAnalyticsNeedsAttention] = useState(null);
  const [analyticsStrongestDay, setAnalyticsStrongestDay] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfiles[0]?.id;

        if (userProfiles.length > 0) {
          setUserProfile(userProfiles[0]);
        }

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
        const totalHabitLogs = allHabitLogs.length;
        const logsLast7 = allHabitLogs.filter(l => new Date(l.created_date) >= sevenDaysAgo);
        const habitLogsLast7 = logsLast7.length;
        
        const doneCount = logsLast7.filter(l => l.status === 'done').length;
        const totalTracked = logsLast7.filter(l => ['done', 'skipped', 'missed'].includes(l.status)).length;
        const habitDoneRate = totalTracked > 0 ? Math.round((doneCount / totalTracked) * 100) : 0;

        // Fetch active habits and compute insights
        const activeHabits = await base44.entities.Habit.filter({ userId, isActive: true });
        
        // Compute insights (non-blocking)
        setTimeout(() => {
          const consistent = getMostConsistentHabit(activeHabits, allHabitLogs);
          const missed = getMostMissedHabit(activeHabits, allHabitLogs);
          const weekday = getBestWeekday(allHabitLogs);
          
          setMostConsistentHabit(consistent);
          setMostMissedHabit(missed);
          setBestWeekday(weekday);
          
          // Compute analytics cards
          const analyticsConsistent = getConsistent(activeHabits, allHabitLogs);
          const analyticsAttention = getNeedsAttentionHabit(activeHabits, allHabitLogs);
          const analyticsDay = getStrongestDay(allHabitLogs);
          
          setAnalyticsConsistent(analyticsConsistent);
          setAnalyticsNeedsAttention(analyticsAttention);
          setAnalyticsStrongestDay(analyticsDay);
        }, 0);

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
          decisionsWithScoring,
          totalHabitLogs
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const handleGenerateWeeklyReview = async () => {
    if (!userProfile || userProfile.planTier !== 'premium') {
      return;
    }

    setGenerating(true);
    try {
      const currentUser = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      const userId = userProfiles[0]?.id;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Gather journal entries
      const journalEntries = await base44.entities.JournalEntry.filter({ userId });
      const recentJournals = journalEntries
        .filter(e => new Date(e.created_date) >= sevenDaysAgo)
        .map(e => ({
          createdAt: e.created_date,
          title: e.title || 'Untitled',
          body: e.body.substring(0, 500)
        }));

      // Gather habit logs
      const habitLogs = await base44.entities.HabitLog.filter({ userId });
      const recentHabitLogs = habitLogs.filter(l => new Date(l.created_date) >= sevenDaysAgo);
      
      const habits = await base44.entities.Habit.filter({ userId });
      const habitMap = {};
      habits.forEach(h => { habitMap[h.id] = h.name; });

      const habitLogsData = recentHabitLogs.map(log => ({
        date: log.date,
        habitName: habitMap[log.habitId] || 'Unknown habit',
        status: log.status
      }));

      // Gather decisions
      const decisions = await base44.entities.Decision.filter({ userId });
      const recentDecisions = decisions.filter(d => new Date(d.created_date) >= sevenDaysAgo);
      
      const allScores = await base44.entities.DecisionScore.filter({ userId });
      const allOptions = await base44.entities.DecisionOption.filter({ userId });
      const allCriteria = await base44.entities.DecisionCriterion.filter({ userId });

      const decisionsData = await Promise.all(recentDecisions.map(async decision => {
        const decisionScores = allScores.filter(s => s.decisionId === decision.id);
        const scoringExists = decisionScores.length > 0;

        let topOption = null;
        if (scoringExists) {
          const options = allOptions.filter(o => o.decisionId === decision.id);
          const criteria = allCriteria.filter(c => c.decisionId === decision.id);
          
          const results = options.map(option => {
            let total = 0;
            criteria.forEach(criterion => {
              const score = decisionScores.find(s => s.optionId === option.id && s.criterionId === criterion.id);
              if (score) {
                total += score.score * criterion.weight;
              }
            });
            return { name: option.name, total };
          });
          
          results.sort((a, b) => b.total - a.total);
          if (results.length > 0) {
            topOption = results[0].name;
          }
        }

        return {
          title: decision.title,
          scoringExists,
          topOption
        };
      }));

      const prompt = `You are a supportive personal cognitive assistant analyzing a user's weekly activity. 

CRITICAL SAFETY RULES:
- No medical or therapy claims
- No diagnosing
- If unsafe content is detected, include: "If you feel unsafe or in danger, contact local emergency services."
- Keep tone calm, supportive, and objective

Weekly Data:
Journal Entries: ${JSON.stringify(recentJournals, null, 2)}
Habit Logs: ${JSON.stringify(habitLogsData, null, 2)}
Decisions: ${JSON.stringify(decisionsData, null, 2)}

Provide a structured weekly review in the following JSON format:
{
  "week_summary": "A concise summary of the week's activity in max 120 words",
  "patterns": ["First pattern observed", "Second pattern observed", "Third pattern observed"],
  "next_week_focus": ["First focus area", "Second focus area", "Third focus area"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            week_summary: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            next_week_focus: { type: "array", items: { type: "string" } }
          }
        }
      });

      setWeeklyReview(response);
    } catch (error) {
      console.error('Error generating weekly review:', error);
    } finally {
      setGenerating(false);
    }
  };

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
        ) : !userProfile ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>Insights will appear after you start using Seanna.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <WeeklyPatternCard 
              mostConsistent={mostConsistentHabit}
              mostMissed={mostMissedHabit}
              bestWeekday={bestWeekday}
              totalLogs={metrics.totalHabitLogs}
            />

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

            {/* Analytics Cards */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Analytics
              </h2>
              <div className="space-y-3">
                {/* Most consistent habit */}
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#0F1115',
                    borderRadius: '12px'
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                    Most consistent habit
                  </h3>
                  {analyticsConsistent ? (
                    <>
                      <p className="text-sm mb-1 font-medium" style={{ color: '#E8EAF0' }}>
                        {analyticsConsistent.name}
                      </p>
                      <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                        {Math.round(analyticsConsistent.completionRate)}% completion
                      </p>
                      <p className="text-xs" style={{ color: '#9AA3B2', fontStyle: 'italic' }}>
                        This system is working well.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      Track a few days to see patterns.
                    </p>
                  )}
                </div>

                {/* Needs attention */}
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#0F1115',
                    borderRadius: '12px'
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                    Needs attention
                  </h3>
                  {analyticsNeedsAttention ? (
                    <>
                      <p className="text-sm mb-1 font-medium" style={{ color: '#E8EAF0' }}>
                        {analyticsNeedsAttention.name}
                      </p>
                      <p className="text-xs" style={{ color: '#9AA3B2' }}>
                        This habit is frequently missed.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      Track a few days to see patterns.
                    </p>
                  )}
                </div>

                {/* Strongest day */}
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#0F1115',
                    borderRadius: '12px'
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                    Strongest day
                  </h3>
                  {analyticsStrongestDay ? (
                    <p className="text-sm" style={{ color: '#E8EAF0' }}>
                      You perform best on {analyticsStrongestDay}.
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      More tracking needed to detect patterns.
                    </p>
                  )}
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

            {/* Weekly Highlights Section */}
            {metrics.totalHabitLogs >= 3 ? (
              <div
                className="p-5"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px'
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                  Weekly Highlights
                </h2>
                <div className="space-y-3">
                  {/* Card 1: Most consistent habit */}
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: '#0F1115',
                      borderRadius: '12px'
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                      Most consistent
                    </h3>
                    {mostConsistentHabit ? (
                      <>
                        <p className="text-sm mb-1" style={{ color: '#E8EAF0' }}>
                          You stayed consistent with: {mostConsistentHabit.name}
                        </p>
                        <p className="text-xs" style={{ color: '#9AA3B2' }}>
                          High completion this week
                        </p>
                      </>
                    ) : (
                      <p className="text-sm" style={{ color: '#9AA3B2' }}>
                        No consistency data yet
                      </p>
                    )}
                  </div>

                  {/* Card 2: Most missed */}
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: '#0F1115',
                      borderRadius: '12px'
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                      Needs attention
                    </h3>
                    {mostMissedHabit ? (
                      <p className="text-sm" style={{ color: '#E8EAF0' }}>
                        Most missed habit: {mostMissedHabit.name}
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: '#9AA3B2' }}>
                        No missed habits this week
                      </p>
                    )}
                  </div>

                  {/* Card 3: Best weekday */}
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: '#0F1115',
                      borderRadius: '12px'
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                      Strongest day
                    </h3>
                    {bestWeekday ? (
                      <p className="text-sm" style={{ color: '#E8EAF0' }}>
                        Your best day: {bestWeekday}
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: '#9AA3B2' }}>
                        Not enough data yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="p-5 text-center"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px'
                }}
              >
                <p className="text-sm" style={{ color: '#9AA3B2' }}>
                  Complete a few habits to unlock weekly insights.
                </p>
              </div>
            )}

            {/* Card 4: Weekly AI Review */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Weekly AI Review
                {userProfile?.planTier !== 'premium' && (
                  <span className="text-xs ml-2" style={{ color: '#9AA3B2' }}>
                    (Premium)
                  </span>
                )}
              </h2>

              {userProfile?.planTier === 'premium' ? (
                <>
                  <button
                    onClick={handleGenerateWeeklyReview}
                    disabled={generating}
                    className="w-full py-3 mb-4 flex items-center justify-center gap-2 font-semibold"
                    style={{
                      backgroundColor: '#C9A227',
                      color: '#0F1115',
                      borderRadius: '18px',
                      opacity: generating ? 0.5 : 1
                    }}
                  >
                    <Sparkles size={18} />
                    {generating ? 'Generating...' : 'Generate Weekly Review'}
                  </button>

                  {weeklyReview && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                          Week Summary
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#E8EAF0' }}>
                          {weeklyReview.week_summary}
                        </p>
                      </div>

                      {weeklyReview.patterns && weeklyReview.patterns.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                            Patterns
                          </h3>
                          <ul className="space-y-1">
                            {weeklyReview.patterns.map((pattern, index) => (
                              <li key={index} className="flex gap-2">
                                <span style={{ color: '#C9A227' }}>•</span>
                                <span className="text-sm" style={{ color: '#E8EAF0' }}>
                                  {pattern}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {weeklyReview.next_week_focus && weeklyReview.next_week_focus.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>
                            Next Week Focus
                          </h3>
                          <ul className="space-y-1">
                            {weeklyReview.next_week_focus.map((focus, index) => (
                              <li key={index} className="flex gap-2">
                                <span style={{ color: '#C9A227' }}>•</span>
                                <span className="text-sm" style={{ color: '#E8EAF0' }}>
                                  {focus}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Lock size={32} className="mx-auto mb-3" style={{ color: '#9AA3B2' }} />
                  <p className="text-sm" style={{ color: '#9AA3B2' }}>
                    Upgrade to Premium to unlock Weekly AI Review.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}