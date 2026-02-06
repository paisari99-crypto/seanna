import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { format } from 'date-fns';

export default function DecisionDetail() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [options, setOptions] = useState([]);
  const [criteria, setCriteria] = useState([]);
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

        const decisions = await base44.entities.Decision.filter({ id });
        if (decisions.length === 0) {
          navigate(createPageUrl('Decisions'));
          return;
        }
        
        setDecision(decisions[0]);

        const decisionOptions = await base44.entities.DecisionOption.filter(
          { decisionId: id },
          '-created_date'
        );
        setOptions(decisionOptions);

        const decisionCriteria = await base44.entities.DecisionCriterion.filter(
          { decisionId: id },
          '-created_date'
        );
        setCriteria(decisionCriteria);
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
                      Weight: {criterion.weight}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}