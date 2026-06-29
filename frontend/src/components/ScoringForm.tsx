import React from 'react';
import type { Project, Evaluation, ScoreMap } from '../types';

import { CRITERIA } from '../constants/data';
import ProjectPanel from './ProjectPanel';
import CriteriaCard from './CriteriaCard';

interface ScoringFormProps {
  projects: Project[];
  evaluations: Record<string, Evaluation>;
  pushedProjects: string[];
  selectedProjectId: string;
  currentScores: ScoreMap;
  currentComment: string;
  saving: boolean;
  onProjectChange: (id: string) => void;
  onScoreChange: (criteriaId: string, value: string) => void;
  onCommentChange: (comment: string) => void;
  onSave: () => void;
}

const ScoringForm: React.FC<ScoringFormProps> = ({
  projects,
  evaluations,
  pushedProjects,
  selectedProjectId,
  currentScores,
  currentComment,
  saving,
  onProjectChange,
  onScoreChange,
  onCommentChange,
  onSave,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const calculateTotal = () => {
    let total = 0;
    CRITERIA.forEach((c) => {
      total += parseFloat(String(currentScores[c.id])) || 0;
    });
    return total.toFixed(2);
  };

  return (
    <div className="scoring-layout">
      {/* LEFT: Project panel */}
      <ProjectPanel
        projects={projects}
        selectedProjectId={selectedProjectId}
        evaluations={evaluations}
        pushedProjects={pushedProjects}
        currentTotal={calculateTotal()}
        comment={currentComment}
        onProjectChange={onProjectChange}
        onCommentChange={onCommentChange}
        onSave={onSave}
        saving={saving}
      />

      {/* RIGHT: Criteria cards */}
      <div className="criteria-column">
        <div className="criteria-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="criteria-banner-title">Scoring Criteria &amp; Evaluation Rubric</h3>
            <p className="criteria-banner-sub">
              โปรดอ่านเกณฑ์การให้คะแนนแต่ละด้านให้ครบถ้วนก่อนพิจารณาปรับคะแนน
            </p>
          </div>
          <div className="step-indicator" style={{ color: 'var(--white)', backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
            หัวข้อที่ {activeIndex + 1} / {CRITERIA.length}
          </div>
        </div>
        
        <CriteriaCard
          criterion={CRITERIA[activeIndex]}
          scores={currentScores}
          onScoreChange={onScoreChange}
        />

        <div className="criteria-nav">
          <button 
            disabled={activeIndex === 0} 
            onClick={() => setActiveIndex(i => i - 1)}
            className="nav-btn-secondary"
            style={{ visibility: activeIndex === 0 ? 'hidden' : 'visible' }}
          >
            ← ก่อนหน้า
          </button>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            {activeIndex === CRITERIA.length - 1 && (
              <span className="finish-hint" style={{ fontSize: '16px' }}>
                ✅ ประเมินครบแล้ว (กรุณากด Save ที่แถบด้านซ้ายมือ)
              </span>
            )}
          </div>

          <button 
            onClick={() => setActiveIndex(i => i + 1)}
            className="nav-btn-primary"
            style={{ visibility: activeIndex < CRITERIA.length - 1 ? 'visible' : 'hidden' }}
          >
            ถัดไป →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringForm;
