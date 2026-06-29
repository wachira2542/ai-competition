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
        <div className="criteria-header-banner">
          <h3 className="criteria-banner-title">Scoring Criteria &amp; Evaluation Rubric</h3>
          <p className="criteria-banner-sub">
            โปรดอ่านเกณฑ์การให้คะแนนแต่ละด้านให้ครบถ้วนก่อนพิจารณาปรับคะแนน
          </p>
        </div>
        {CRITERIA.map((criterion) => (
          <CriteriaCard
            key={criterion.id}
            criterion={criterion}
            scores={currentScores}
            onScoreChange={onScoreChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ScoringForm;
