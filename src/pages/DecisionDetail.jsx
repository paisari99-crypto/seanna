import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';

export default function DecisionDetail() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [options, setOptions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          navigate(createPageUrl('Decisions'));
          return;
        }

        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const currentUserId = userProfiles[0]?.id;
        setUserId(currentUserId);

        const decisions = await base44.entities.Decision.filter({ id, userId: currentUserId });
        if (decisions.length === 0) {
          navigate(createPageUrl('Decisions'));
          return;
        }
        
        setDecision(decisions[0]);

        const decisionOptions = await base44.entities.DecisionOption.filter(
          { decisionId: id, userId: currentUserId },
          '-created_date'
        );
        setOptions(decisionOptions);

        const decisionCriteria = await base44.entities.DecisionCriterion.filter(
          { decisionId: id, userId: currentUserId },
          '-created_date'
        );
        setCriteria(decisionCriteria);

        const decisionScores = await base44.entities.DecisionScore.filter({ decisionId: id, userId: currentUserId });
        const scoresMap = {};
        decisionScores.forEach(score => {
          const key = `${score.optionId}-${score.criterionId}`;
          scoresMap[key] = score;
        });
        setScores(scoresMap);
      } catch (error) {
        console.error('Error loading decision:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const truncateNotes = (notes) => {
    if (!notes) return '';
    return notes.length > 60 ? notes.substring(0, 60) + '...' : notes;
  };

  const handleScoreChange = async (optionId, criterionId, newScore) => {
    const key = `${optionId}-${criterionId}`;
    const existingScore = scores[key];

    try {
      if (existingScore) {
        await base44.entities.DecisionScore.update(existingScore.id, { score: newScore });
        setScores(prev => ({
          ...prev,
          [key]: { ...existingScore, score: newScore }
        }));
      } else {
        const newScoreRecord = await base44.entities.DecisionScore.create({
          decisionId: decision.id,
          optionId,
          criterionId,
          userId,
          score: newScore
        });
        setScores(prev => ({
          ...prev,
          [key]: newScoreRecord
        }));
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const getImportanceLabel = (weight) => {
    const labels = {
      1: 'Low',
      2: 'Medium-low',
      3: 'Medium',
      4: 'High',
      5: 'Critical'
    };
    return labels[weight] || 'Medium';
  };

  const calculateResults = () => {
    const results = options.map(option => {
      let total = 0;
      criteria.forEach(criterion => {
        const key = `${option.id}-${criterion.id}`;
        const score = scores[key]?.score || 0;
        total += score * criterion.weight;
      });
      return { option, total };
    });
    return results.sort((a, b) => b.total - a.total);
  };

  const canScore = options.length >= 2 && criteria.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
        <p style={{ color: '#9AA3B2' }}>Loading...</p>
        <BottomNav />
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6 space-y-8">
        {/* Section 1 - Decision Overview */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2"
            style={{ color: '#9AA3B2' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
            {decision.title}
          </h1>
          <p className="text-sm mb-4" style={{ color: '#9AA3B2' }}>
            {format(new Date(decision.created_date), 'MMMM d, yyyy • h:mm a')}
          </p>
          {decision.context && (
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#E8EAF0' }}>
                {decision.context}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`${createPageUrl('DecisionOptionNew')}?decisionId=${decision.id}`)}
              className="flex-1 py-3 flex items-center justify-center gap-2 font-semibold"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              <Plus size={18} />
              Add option
            </button>
            <button
              onClick={() => navigate(`${createPageUrl('DecisionCriterionNew')}?decisionId=${decision.id}`)}
              className="flex-1 py-3 flex items-center justify-center gap-2 font-semibold"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              <Plus size={18} />
              Add criterion
            </button>
          </div>
        </div>

        {/* Section 2 - Options */}
        <div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Options
          </h2>
          {options.length === 0 ? (
            <p className="text-center py-6" style={{ color: '#9AA3B2' }}>
              Add at least two options to compare.
            </p>
          ) : (
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => navigate(`${createPageUrl('DecisionOptionDetail')}?id=${option.id}`)}
                  className="w-full text-left p-4 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#E8EAF0' }}>
                    {option.name}
                  </h3>
                  {option.notes && (
                    <p className="text-sm" style={{ color: '#9AA3B2' }}>
                      {truncateNotes(option.notes)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 3 - Criteria */}
        <div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Criteria
          </h2>
          {criteria.length === 0 ? (
            <p className="text-center py-6" style={{ color: '#9AA3B2' }}>
              Add criteria to evaluate your options.
            </p>
          ) : (
            <div className="space-y-3">
              {criteria.map((criterion) => (
                <button
                  key={criterion.id}
                  onClick={() => navigate(`${createPageUrl('DecisionCriterionDetail')}?id=${criterion.id}`)}
                  className="w-full text-left p-4 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>
                      {criterion.name}
                    </h3>
                    <span
                      className="px-3 py-1 text-sm"
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#C9A227',
                        borderRadius: '12px'
                      }}
                    >
                      Importance: {getImportanceLabel(criterion.weight)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 4 - Scoring */}
        <div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Scoring
          </h2>
          {!canScore ? (
            <p className="text-center py-6" style={{ color: '#9AA3B2' }}>
              Add at least 2 options and 1 criterion to score.
            </p>
          ) : (
            <div className="space-y-6">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="p-4"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold" style={{ color: '#E8EAF0' }}>
                      {criterion.name}
                    </h3>
                    <span
                      className="px-2 py-1 text-xs"
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#C9A227',
                        borderRadius: '12px'
                      }}
                    >
                      Importance: {getImportanceLabel(criterion.weight)}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {options.map((option) => {
                      const key = `${option.id}-${criterion.id}`;
                      const currentScore = scores[key]?.score || 0;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: '#9AA3B2' }}>
                              {option.name}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#C9A227' }}>
                              {currentScore}
                            </span>
                          </div>
                          <Slider
                            value={[currentScore]}
                            onValueChange={(values) => handleScoreChange(option.id, criterion.id, values[0])}
                            min={0}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5 - Results */}
        {canScore && (
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#E8EAF0' }}>
              Results
            </h2>
            <div className="space-y-3">
              {calculateResults().map((result, index) => (
                <div
                  key={result.option.id}
                  className="p-4"
                  style={{
                    backgroundColor: index === 0 ? '#C9A227' : '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: index === 0 ? '#0F1115' : '#E8EAF0' }}
                      >
                        {index + 1}. {result.option.name}
                      </h3>
                      {index === 0 && (
                        <p className="text-xs mt-1" style={{ color: '#0F1115', opacity: 0.8 }}>
                          Best option
                        </p>
                      )}
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: index === 0 ? '#0F1115' : '#C9A227' }}
                    >
                      {result.total.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}