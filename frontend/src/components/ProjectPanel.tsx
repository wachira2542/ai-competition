import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Project, Evaluation } from '../types';


interface ProjectPanelProps {
  projects: Project[];
  selectedProjectId: string;
  evaluations: Record<string, Evaluation>;
  pushedProjects: string[];
  currentTotal: string;
  comment: string;
  onProjectChange: (id: string) => void;
  onCommentChange: (comment: string) => void;
  onSave: () => void;
  saving: boolean;
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
  onSave,
  saving,
}) => {
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isEvaluated = !!evaluations[selectedProjectId];

  return (
    <div className="project-panel">
      <div className="panel-header">
        <h2 className="panel-title">Project Details</h2>
        <p className="panel-subtitle">เลือกผลงานของกลุ่มบริษัท AAPICO เพื่อทำการประเมิน</p>
      </div>

      {/* Project Selector */}
      <div className="form-group">
        <label className="form-label">Select Company &amp; Project</label>
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
            <span className="meta-tag">Objective</span>
            <p className="meta-desc">{selectedProject.objective}</p>
          </div>
          <div className="meta-item">
            <span className="meta-tag">AI Tech Stack</span>
            <p className="meta-mono">{selectedProject.tech_stack}</p>
          </div>
          <div className="meta-item">
            <span className="meta-tag">Target Users</span>
            <p className="meta-desc">{selectedProject.target_users}</p>
          </div>
          <div className="meta-item">
            <span className="meta-tag">Status</span>
            <div className="status-badge-wrap">
              {isEvaluated ? (
                <span className="status-badge status-badge--done">
                  <CheckCircle size={15} />
                  ประเมินแล้ว ({evaluations[selectedProjectId].total_score.toFixed(2)} คะแนน)
                </span>
              ) : (
                <span className="status-badge status-badge--pending">
                  <AlertCircle size={15} />
                  รอกรรมการประเมินผลคะแนน
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="form-group">
        <label className="form-label">Additional Feedback / ข้อสังเกต</label>
        <textarea
          id="feedback-textarea"
          className="form-textarea"
          rows={3}
          placeholder="โปรดระบุความคิดเห็นหรือข้อแนะนำที่เป็นประโยชน์เพิ่มเติม..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </div>

      {/* Score + Save */}
      <div className="score-summary">
        <div>
          <p className="score-label">TOTAL EVALUATION SCORE</p>
          <div className="score-display">
            {currentTotal} <span className="score-max">/ 100</span>
          </div>
        </div>
        <button
          id="save-btn"
          onClick={onSave}
          disabled={saving}
          className="save-btn"
        >
          {saving ? '⏳ Saving...' : '💾 Save Evaluation'}
        </button>
      </div>
    </div>
  );
};

export default ProjectPanel;
