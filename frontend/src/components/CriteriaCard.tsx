import React from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { Criterion, ScoreMap } from '../types';

interface CriteriaCardProps {
  criterion: Criterion;
  scores: ScoreMap;
  onScoreChange: (id: string, value: string) => void;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ criterion, scores, onScoreChange }) => {
  const rawValue = scores[criterion.id] !== undefined ? scores[criterion.id] : 0;
  const currentScore = parseFloat(String(rawValue)) || 0;

  const [showRubrics, setShowRubrics] = React.useState(false);

  let cardBorderColor = 'var(--light-gray)';
  
  if (currentScore > 0) {
    const activeRubric = criterion.rubrics.find(r => currentScore >= r.min && currentScore <= r.max);
    if (activeRubric) {
      if (activeRubric.label === 'High') {
        cardBorderColor = '#25a840';
      } else if (activeRubric.label === 'Medium') {
        cardBorderColor = '#0062cc';
      } else if (activeRubric.label === 'Low') {
        cardBorderColor = '#d97706';
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderLeft: `6px solid ${currentScore > 0 ? cardBorderColor : 'transparent'}`, transition: 'all 0.3s ease', backgroundColor: currentScore > 0 ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
      {/* Header + Score Input side-by-side */}
      <div className="criteria-header" style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 className="criteria-name" style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>{criterion.name}</h4>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="criteria-max-badge" style={{ padding: '4px 8px', fontSize: '11px' }}>MAX: {criterion.maxScore}</div>
          <div className="score-input-wrap" style={{ background: 'var(--bg)', padding: '4px', border: '1px solid var(--light-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              min={0}
              max={criterion.maxScore}
              step={0.1}
              className="score-input"
              value={rawValue}
              onChange={(e) => {
                let val = e.target.value;
                if (parseFloat(val) > criterion.maxScore) val = String(criterion.maxScore);
                onScoreChange(criterion.id, val);
              }}
              onBlur={(e) => {
                if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                  onScoreChange(criterion.id, '');
                } else {
                  onScoreChange(criterion.id, parseFloat(e.target.value).toFixed(1));
                }
              }}
              placeholder="0.0"
              style={{ fontSize: '20px', width: '70px', textAlign: 'center', padding: '2px', border: 'none', borderBottom: '2px solid var(--green)', background: 'var(--navy)', color: 'white', outline: 'none' }}
            />
            <span className="score-unit" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>PTS</span>
          </div>
        </div>
      </div>

      {/* Accordion Toggle */}
      <div style={{ marginTop: '8px', borderTop: '1px solid var(--light-gray)', paddingTop: '8px' }}>
        <button 
          onClick={() => setShowRubrics(!showRubrics)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'var(--dark)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', padding: '4px', width: '100%', justifyContent: 'center' }}
        >
          <Info size={14} /> 
          {showRubrics ? 'ซ่อนรายละเอียดเกณฑ์' : 'ดูรายละเอียดเกณฑ์'}
          {showRubrics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Rubrics (High, Medium, Low) */}
      {showRubrics && (
        <div className="rubric-section" style={{ marginTop: '10px', marginBottom: 0 }}>
          <div className="rubric-list" style={{ gap: '8px' }}>
            {criterion.rubrics.map((r, idx) => {
              const isSelected = currentScore >= r.min && currentScore <= r.max;
              
              let bgColor = 'var(--bg)';
              let baseColor = 'var(--dark)';
              
              if (r.label === 'High') {
                baseColor = '#25a840';
                bgColor = 'rgba(45, 200, 77, 0.08)';
              } else if (r.label === 'Medium') {
                baseColor = '#0062cc';
                bgColor = 'rgba(0, 123, 255, 0.08)';
              } else if (r.label === 'Low') {
                baseColor = '#d97706';
                bgColor = 'rgba(245, 158, 11, 0.08)';
              }

              return (
                <div key={idx} style={{ 
                  padding: '10px', border: `1px solid ${isSelected ? baseColor : 'var(--light-gray)'}`, 
                  backgroundColor: isSelected ? bgColor : 'var(--bg)',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                }}>
                  <div className="rubric-item-header" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: baseColor, textTransform: 'uppercase' }}>
                      {r.label}
                    </span>
                    <span style={{ fontSize: '12px', fontFamily: "'Courier New', monospace", fontWeight: 700, background: 'var(--white)', color: 'var(--navy)', padding: '2px 6px', border: '1px solid var(--light-gray)' }}>
                      {r.min} – {r.max} PTS
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.4, margin: 0 }}>{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaCard;
