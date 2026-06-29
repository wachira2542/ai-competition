import React from 'react';
import { Info } from 'lucide-react';
import type { Criterion, ScoreMap } from '../types';


interface CriteriaCardProps {
  criterion: Criterion;
  scores: ScoreMap;
  onScoreChange: (id: string, value: string) => void;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ criterion, scores, onScoreChange }) => {
  const rawValue = scores[criterion.id] !== undefined ? scores[criterion.id] : 0;
  const currentScore = parseFloat(String(rawValue)) || 0;

  return (
    <div className="criteria-card">
      <div className="criteria-top-bar" />

      <div className="criteria-header">
        <div>
          <h4 className="criteria-name">{criterion.name}</h4>
          <p className="criteria-desc">{criterion.description}</p>
        </div>
        <div className="criteria-max-badge">MAX PT: {criterion.maxScore}</div>
      </div>

      {/* Rubric Guide */}
      <div className="rubric-section">
        <span className="rubric-heading">
          <Info size={14} /> Rubric Guide Checklist
        </span>
        <div className="rubric-list">
          {criterion.rubrics.map((r, idx) => {
            const isSelected = currentScore >= r.min && currentScore <= r.max;
            return (
              <div key={idx} className={`rubric-item ${isSelected ? 'rubric-item--active' : ''}`}>
                <div className="rubric-item-header">
                  <span className={`rubric-label ${isSelected ? 'rubric-label--active' : ''}`}>{r.label}</span>
                  <span className={`rubric-range ${isSelected ? 'rubric-range--active' : ''}`}>
                    {r.min} – {r.max} PTS
                  </span>
                </div>
                <p className="rubric-detail">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider + Number Input */}
      <div className="score-control">
        <div className="slider-wrap">
          <span className="slider-min">0</span>
          <input
            type="range"
            min={0}
            max={criterion.maxScore}
            step={0.1}
            className="slider"
            value={currentScore}
            onChange={(e) => onScoreChange(criterion.id, e.target.value)}
          />
          <span className="slider-max">{criterion.maxScore}</span>
        </div>
        <div className="score-input-wrap">
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
                onScoreChange(criterion.id, '0.0');
              } else {
                onScoreChange(criterion.id, parseFloat(e.target.value).toFixed(1));
              }
            }}
            placeholder="0.0"
          />
          <span className="score-unit">PTS</span>
        </div>
      </div>
    </div>
  );
};

export default CriteriaCard;
