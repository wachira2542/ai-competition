import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Project, Evaluation } from '../types';
import { useLanguage } from '../context/LanguageContext';


interface ProjectPanelProps {
  projects: Project[];
  selectedProjectId: string;
  evaluations: Record<string, Evaluation>;
  pushedProjects: string[];
  currentTotal: string;
  comment: string;
  onProjectChange: (id: string) => void;
  onCommentChange: (comment: string) => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({
  projects,
  selectedProjectId,
  evaluations,
  pushedProjects,
  currentTotal,
  comment,
  onProjectChange,
  onCommentChange,
}) => {
  const { t } = useLanguage();
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isEvaluated = !!evaluations[selectedProjectId];

  return (
    <div className="project-panel">
      <div className="panel-header">
        <h2 className="panel-title">{t('judge.projectInfo')}</h2>
        <p className="panel-subtitle"></p>
      </div>

      <div className="score-summary-top" style={{ textAlign: 'center', marginBottom: '12px', padding: '12px', background: 'var(--bg)', border: '2px solid var(--navy)' }}>
        <p className="score-label">{t('judge.totalScore')}</p>
        <div className="score-display" style={{ marginBottom: 0 }}>
          {currentTotal} <span className="score-max">/ 100</span>
        </div>
      </div>

      {/* Project Selector */}
      <div className="form-group">
        <label className="form-label">{t('judge.selectProject')}</label>
        <select
          id="project-select"
          className="form-select"
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {pushedProjects.includes(p.id) ? '✓ ' : ''}{p.team} — {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project Meta */}
      {selectedProject && (
        <div className="project-meta">
          <div className="meta-item">
            <span className="meta-tag">Company</span>
            <p className="meta-value meta-value--large">{selectedProject.team}</p>
          </div>
          <div className="meta-item">
            <span className="meta-tag">Project Name</span>
            <p className="meta-value">{selectedProject.name}</p>
          </div>
          <div className="meta-item">
            <span className="meta-tag">{t('judge.status')}</span>
            <div className="status-badge-wrap">
              {isEvaluated ? (
                <span className="status-badge status-badge--done">
                  <CheckCircle size={15} />
                  {t('judge.completed')} ({evaluations[selectedProjectId].total_score.toFixed(2)} PTS)
                </span>
              ) : (
                <span className="status-badge status-badge--pending">
                  <AlertCircle size={15} />
                  {t('judge.pending')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="form-group">
        <label className="form-label">{t('judge.commentLabel')}</label>
        <textarea
          id="feedback-textarea"
          className="form-textarea"
          rows={2}
          placeholder={t('judge.commentPlaceholder')}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </div>

    </div>
  );
};

export default ProjectPanel;
