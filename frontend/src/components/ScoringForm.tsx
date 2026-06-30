import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Project, Evaluation, ScoreMap } from '../types';

import { useCriteria } from '../hooks/useCriteria';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  const CRITERIA = useCriteria();
  
  // Pagination removed. All criteria shown on one page.

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
      />

      {/* RIGHT: Criteria cards */}
      <div className="criteria-column">
        <div className="criteria-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="criteria-banner-title">{t('judge.scoring')}</h3>
            <p className="criteria-banner-sub"></p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', border: '2px solid var(--light-gray)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          {CRITERIA.map((criterion, index) => (
            <div key={criterion.id} style={{ borderBottom: index < CRITERIA.length - 1 ? '1px solid var(--light-gray)' : 'none' }}>
              <CriteriaCard
                criterion={criterion}
                scores={currentScores}
                onScoreChange={onScoreChange}
              />
            </div>
          ))}
        </div>

        {/* Save Button in the middle column */}
        <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '2px dashed var(--light-gray)' }}>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              id="save-btn"
              onClick={onSave}
              disabled={saving || !CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')}
              className={`save-btn ${(!saving && CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')) ? 'animate-pulse-slight' : ''}`}
              style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', fontSize: '18px', padding: '16px', backgroundColor: (saving || !CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')) ? 'var(--light-gray)' : 'var(--green)', color: (saving || !CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')) ? 'var(--muted)' : 'var(--black)', border: 'none', boxShadow: (saving || !CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')) ? 'none' : '0 4px 12px rgba(45,200,77,0.3)', cursor: (saving || !CRITERIA.every(c => currentScores[c.id] !== undefined && currentScores[c.id] !== '')) ? 'not-allowed' : 'pointer' }}
            >
              {saving ? t('judge.saving') : t('judge.save')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Evaluated Task List Sidebar */}
      <div className="right-sidebar" style={{ background: 'var(--white)', border: '2px solid var(--light-gray)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '2px solid var(--light-gray)' }}>
          <CheckCircle size={18} /> {t('judge.completed')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {projects.filter(p => evaluations[p.id]).map(p => (
            <div
              key={p.id}
              onClick={() => onProjectChange(p.id)}
              style={{ padding: '10px 14px', backgroundColor: p.id === selectedProjectId ? 'var(--navy)' : 'var(--bg)', color: p.id === selectedProjectId ? 'white' : 'var(--navy)', border: '1px solid var(--light-gray)', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: p.id === selectedProjectId ? 'var(--shadow-md)' : 'none' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{p.team}</span>
                <span style={{ fontSize: '11px', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: p.id === selectedProjectId ? 'var(--green)' : 'var(--navy)', flexShrink: 0, marginLeft: '8px' }}>
                {evaluations[p.id].total_score.toFixed(2)}
              </div>
            </div>
          ))}
          {projects.filter(p => evaluations[p.id]).length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '20px 12px' }}>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoringForm;
