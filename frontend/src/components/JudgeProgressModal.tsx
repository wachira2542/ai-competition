import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Project, Evaluation } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Judge {
  id: number;
  username: string;
}

interface JudgeProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  evaluations: Record<string, Evaluation>;
  activeProjectId: string | null;
}

export default function JudgeProgressModal({ isOpen, onClose, projects, evaluations, activeProjectId }: JudgeProgressModalProps) {
  const { t } = useLanguage();
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (!selectedProjectId && activeProjectId) {
        setSelectedProjectId(activeProjectId);
      }
      setLoading(true);
      fetch('/api/admin/judges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setJudges(data.data);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process evaluations to see judge's progress
  // evaluations structure: { project_id: { ..., details: [ { user_id, username, total_score ... } ] } }

  const getJudgeProgress = (judgeId: number) => {
    let evaluatedCount = 0;
    let selectedProjectStatus = 'Not Started';
    let selectedProjectScore = 0;

    Object.values(evaluations).forEach(ev => {
      // Find if this judge evaluated this project
      const judgeDetail = ev.details?.find((d: any) => d.user_id === judgeId);
      if (judgeDetail) {
        evaluatedCount++;
        if (ev.project_id === selectedProjectId) {
          selectedProjectStatus = 'Completed';
          selectedProjectScore = judgeDetail.total_score;
        }
      }
    });

    if (selectedProjectId && selectedProjectStatus === 'Not Started') {
      selectedProjectStatus = 'Waiting / In Progress';
    }

    return { evaluatedCount, selectedProjectStatus, selectedProjectScore };
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--light-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--navy)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('admin.judgeProgress')}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--navy)' }}>Loading...</div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{t('admin.selectProjectToCheck')}:</strong>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--light-gray)', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="">{t('admin.noProjectSelected')}</option>
                    {projects.map(p => {
                      const isEvaluated = !!evaluations[p.id];
                      return (
                        <option 
                          key={p.id} 
                          value={p.id}
                          style={isEvaluated ? { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' } : {}}
                        >
                          {p.id}: {p.name} {p.id === activeProjectId ? `(${t('admin.active')})` : ''} {isEvaluated ? '(ประเมินแล้ว)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="animate-pulse-slight" style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'var(--green)', borderRadius: '50%' }}></span>
                  {t('admin.autoRefresh')}
                </div>
              </div>

              <table className="standings-table">
                <thead className="standings-thead-row">
                  <tr>
                    <th className="standings-th">{t('dashboard.judgeName')}</th>
                    <th className="standings-th standings-th--center">{t('admin.totalEvaluated')}</th>
                    <th className="standings-th standings-th--center">{t('admin.selectedStatus')}</th>
                    <th className="standings-th standings-th--center">{t('admin.score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map(judge => {
                    const { evaluatedCount, selectedProjectStatus, selectedProjectScore } = getJudgeProgress(judge.id);

                    let statusColor = 'var(--muted)';
                    let StatusIcon = AlertCircle;

                    if (selectedProjectStatus === 'Completed') {
                      statusColor = 'var(--green)';
                      StatusIcon = CheckCircle;
                    } else if (selectedProjectStatus === 'Waiting / In Progress') {
                      statusColor = '#f59e0b';
                      StatusIcon = Clock;
                    }

                    return (
                      <tr key={judge.id} className="standings-row" style={{ transition: 'background-color 0.3s' }}>
                        <td className="standings-td" style={{ fontWeight: 600 }}>{judge.username}</td>
                        <td className="standings-td standings-th--center">
                          <span style={{ backgroundColor: 'var(--bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}>
                            {evaluatedCount} / {projects.length}
                          </span>
                        </td>
                        <td className="standings-td standings-th--center" style={{ color: statusColor, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '100%' }}>
                          {selectedProjectId ? (
                            <>
                              <StatusIcon size={16} />
                              {selectedProjectStatus === 'Completed' ? t('judge.completed') : (selectedProjectStatus === 'Not Started' ? t('judge.pending') : t('judge.pending'))}
                            </>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{t('admin.noProjectSelected')}</span>
                          )}
                        </td>
                        <td className="standings-td standings-th--center" style={{ fontWeight: 700, fontSize: '15px' }}>
                          {selectedProjectId && selectedProjectStatus === 'Completed' ? (
                            <span style={{ color: 'var(--navy)' }}>{selectedProjectScore.toFixed(2)}</span>
                          ) : (
                            <span style={{ color: 'var(--light-gray)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
