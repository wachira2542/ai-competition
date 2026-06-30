import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Trophy, Play } from 'lucide-react';
import type { Project, Evaluation, ProjectWithEvaluation, RevealState, ScoreMap } from '../types';
import { useCriteria } from '../hooks/useCriteria';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';

interface DashboardProps {
  projects: Project[];
  evaluations: Record<string, Evaluation>;
  onRevealChange?: (state: RevealState) => void;
  resetTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, evaluations, onRevealChange, resetTrigger }) => {
  const { t } = useLanguage();
  const CRITERIA = useCriteria();
  const [revealState, setRevealState] = useState<RevealState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overall' | 'judges'>('overall');

  const leaderboard = useMemo<ProjectWithEvaluation[]>(() => {
    const results = projects.map((project) => {
      const evalData = evaluations[project.id];
      return {
        ...project,
        isEvaluated: !!evalData,
        totalScore: evalData ? evalData.total_score : 0,
        scores: evalData ? evalData.scores : null,
        comment: evalData ? evalData.comment : '-',
        details: evalData ? evalData.details : undefined,
      };
    });
    return results.sort((a, b) => b.totalScore - a.totalScore);
  }, [projects, evaluations]);

  const evaluationsByJudge = useMemo(() => {
    const map: Record<string, { project: Project; scores: ScoreMap; total: number }[]> = {};
    leaderboard.forEach(project => {
      if (project.details) {
        project.details.forEach(detail => {
          if (!map[detail.username]) {
            map[detail.username] = [];
          }
          map[detail.username].push({
            project,
            scores: detail.scores,
            total: detail.total_score,
          });
        });
      }
    });
    return map;
  }, [leaderboard]);

  const startCountdown = (step: number) => {
    setRevealState(`counting-${step}` as RevealState);
    setCountdown(3);
    let current = 3;
    const timer = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        clearInterval(timer);
        setRevealState(`revealed-${step}` as RevealState);
      }
    }, 1000);
  };

  const evaluatedCount = Object.keys(evaluations).length;

  useEffect(() => {
    if (revealState.startsWith('revealed')) {
      const isFinal = revealState === 'revealed';
      const duration = isFinal ? 8 * 1000 : 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#1D366D', '#2DC84D', '#FFD700', '#C0C0C0', '#CD7F32']
        });
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#1D366D', '#2DC84D', '#FFD700', '#C0C0C0', '#CD7F32']
        });
      }, 250);

      // Initial big burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#1D366D', '#2DC84D', '#FFD700', '#C0C0C0', '#CD7F32']
      });

      return () => clearInterval(interval);
    }
  }, [revealState]);

  useEffect(() => {
    if (onRevealChange) {
      onRevealChange(revealState);
    }
  }, [revealState, onRevealChange]);

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setRevealState('idle');
      setCountdown(3);
    }
  }, [resetTrigger]);

  if (revealState === 'idle') {
    return (
      <div className="reveal-idle">
        <div className="waiting-pulse">
          <BarChart3 size={56} className="waiting-icon" />
        </div>
        <div className="reveal-text">
          <h2 className="reveal-title">Evaluation Results</h2>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot-pulse"></span>
              {t('dashboard.waitingResults')}
            </p>
            <p className="reveal-subtitle" style={{ fontSize: '16px', marginTop: '0' }}>
              ({t('dashboard.evaluated')} <strong>{evaluatedCount}</strong> {t('dashboard.outOf')} {projects.length} {t('dashboard.projects')})
            </p>
          </div>
        </div>
        <button
          id="reveal-btn"
          onClick={() => startCountdown(1)}
          disabled={evaluatedCount === 0}
          className={`reveal-btn ${evaluatedCount === 0 ? 'reveal-btn--disabled' : 'reveal-btn--active'}`}
          style={{ marginTop: '16px' }}
        >
          <Play fill="currentColor" size={28} /> {t('dashboard.revealBtn')}
        </button>
      </div>
    );
  }

  if (revealState.startsWith('counting')) {
    let title = t('dashboard.preparing');
    if (revealState === 'counting-1') title = t('dashboard.preparing1');
    else if (revealState === 'counting-2') title = t('dashboard.preparing2');
    else if (revealState === 'counting-3') title = t('dashboard.preparing3');

    return (
      <div className="countdown-screen-grand">
        <div className="countdown-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <div className="countdown-content">
          <h2 className="countdown-title">{title}</h2>
          <div key={countdown} className="countdown-number-grand">{countdown}</div>
        </div>
      </div>
    );
  }

  const evaluatedProjects = leaderboard.filter((p) => p.isEvaluated);
  const top3 = evaluatedProjects.slice(0, 3);
  const consolation = evaluatedProjects.slice(3, 10);

  const rankMeta = [
    {
      label: t('dashboard.winner'),
      bgClass: 'podium-gold',
      iconColor: '#FFD700',
      rankClass: 'podium-rank-1',
    },
    {
      label: t('dashboard.runnerUp1'),
      bgClass: 'podium-silver',
      iconColor: '#C0C0C0',
      rankClass: 'podium-rank-2',
    },
    {
      label: t('dashboard.runnerUp2'),
      bgClass: 'podium-bronze',
      iconColor: '#CD7F32',
      rankClass: 'podium-rank-3',
    },
  ];

  if (revealState === 'revealed-1' || revealState === 'revealed-2' || revealState === 'revealed-3') {
    const rankIndex = parseInt(revealState.split('-')[1]) - 1; // 0, 1, 2
    const project = top3[rankIndex];
    const meta = rankMeta[rankIndex];

    return (
      <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '600px', backgroundColor: '#f8fafc' }}>
        <h2 className="animate-slide-up" style={{ color: 'var(--navy)', marginBottom: '48px', fontSize: '42px', textAlign: 'center', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          {meta.label}
        </h2>
        
        {project ? (
          <div 
            className="animate-slide-up"
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: meta.bgClass === 'podium-gold' ? 'var(--navy)' : (meta.bgClass === 'podium-silver' ? 'var(--dark)' : '#8a7060'),
              color: 'white',
              padding: '64px',
              borderRadius: '24px',
              borderTop: `12px solid ${meta.iconColor}`,
              boxShadow: `0 24px 60px ${meta.iconColor}40`,
              width: '100%',
              maxWidth: '800px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Modern Glow Effect */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', background: meta.iconColor, filter: 'blur(100px)', opacity: 0.25, zIndex: 0, pointerEvents: 'none' }}></div>
            
            <Trophy size={100} style={{ color: meta.iconColor, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))', zIndex: 1 }} />
            <h3 style={{ fontSize: '48px', marginTop: '32px', fontWeight: 800, zIndex: 1, letterSpacing: '0.02em', textAlign: 'center', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{project.team}</h3>
            <p style={{ fontSize: '22px', opacity: 0.9, fontWeight: 500, marginTop: '12px', zIndex: 1, textAlign: 'center', maxWidth: '80%' }}>{project.name}</p>
            
            <div style={{ marginTop: '48px', padding: '24px 64px', background: 'rgba(0,0,0,0.25)', borderRadius: '20px', display: 'flex', alignItems: 'baseline', gap: '12px', zIndex: 1, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1, color: meta.iconColor, textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>{project.totalScore.toFixed(2)}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>PTS</span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '24px', color: 'var(--muted)' }}>{t('dashboard.noProject')}</p>
        )}

        <button 
          className="animate-fade-in"
          onClick={() => {
            if (rankIndex === 0) startCountdown(2);
            else if (rankIndex === 1) startCountdown(3);
            else setRevealState('revealed');
          }}
          style={{ marginTop: '80px', padding: '16px 48px', fontSize: '20px', backgroundColor: 'var(--navy)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.2s, background-color 0.2s', animationDelay: '2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {rankIndex === 2 ? t('dashboard.showAll') : t('dashboard.nextReveal')}
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">

      {/* Hero */}
      <div className="results-hero" style={{ position: 'relative' }}>
        <h1 className="results-hero-title">{t('dashboard.heroTitle')}</h1>
        <p className="results-hero-sub">{t('dashboard.heroSub')}</p>
        <p className="results-hero-congrats">{t('dashboard.heroCongrats')}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        <button 
          onClick={() => setActiveTab('overall')}
          style={{ padding: '12px 32px', borderRadius: '30px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'overall' ? 'var(--green)' : 'white', color: activeTab === 'overall' ? 'var(--navy)' : 'var(--dark)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {t('dashboard.tabOverall')}
        </button>
        <button 
          onClick={() => setActiveTab('judges')}
          style={{ padding: '12px 32px', borderRadius: '30px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'judges' ? 'var(--navy)' : 'white', color: activeTab === 'judges' ? 'white' : 'var(--dark)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {t('dashboard.tabJudges')}
        </button>
      </div>

      {activeTab === 'overall' && (
        <>
          {/* Top 3 Podium */}
      <div className="podium-grid">
        {top3.map((project, index) => {
          const meta = rankMeta[index];
          return (
            <div key={project.id} className={`podium-card ${meta.bgClass} ${meta.rankClass} animate-slide-up`}>
              <Trophy size={56} style={{ color: meta.iconColor }} className="podium-trophy" />
              <span className="podium-rank-label">{meta.label}</span>
              <h3 className="podium-team">{project.team}</h3>
              <p className="podium-project-name">{project.name}</p>
              <div className="podium-score-wrap">
                <span className="podium-score">{project.totalScore.toFixed(2)}</span>
                <span className="podium-score-unit">PTS</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Honorable Mentions */}
      {consolation.length > 0 && (
        <div className="honorable-section animate-fade-in">
          <div className="honorable-header">
            <h3 className="honorable-title">{t('dashboard.honorableTitle')}</h3>
          </div>
          <div className="honorable-grid">
            {consolation.map((project, index) => (
              <div key={project.id} className="honorable-card">
                <div className="honorable-rank">{index + 4}</div>
                <div className="honorable-info">
                  <div className="honorable-team">{project.team}</div>
                  <div className="honorable-name">{project.name}</div>
                </div>
                <div className="honorable-score-wrap">
                  <div className="honorable-score">{project.totalScore.toFixed(2)}</div>
                  <span className="honorable-score-unit">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Standings Table */}
      <div className="standings-section animate-fade-in">
        <div className="standings-card">
          <div className="standings-header">
            <h2 className="standings-title">
              <BarChart3 size={20} /> {t('dashboard.standingsTitle')}
            </h2>
          </div>
          <div className="standings-table-wrap">
            <table className="standings-table">
              <thead>
                <tr className="standings-thead-row">
                  <th className="standings-th standings-th--center">{t('dashboard.standingsRank')}</th>
                  <th className="standings-th">{t('dashboard.standingsTeam')}</th>
                  {CRITERIA.map((c) => (
                    <th key={c.id} className="standings-th standings-th--center" title={c.name}>
                      {c.name}<br/>
                      <span style={{ fontSize: '9px', fontWeight: 'normal', color: 'var(--muted)' }}>(Max {c.maxScore})</span>
                    </th>
                  ))}
                  <th className="standings-th standings-th--center">{t('dashboard.standingsTotal')}</th>
                  <th className="standings-th">{t('dashboard.standingsFeedback')}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((project, index) => {
                  const rankClass =
                    project.isEvaluated && index === 0
                      ? 'standings-row standings-row--gold'
                      : project.isEvaluated && index === 1
                      ? 'standings-row standings-row--silver'
                      : project.isEvaluated && index === 2
                      ? 'standings-row standings-row--bronze'
                      : 'standings-row';

                  const rankDisplay = project.isEvaluated ? (
                    index === 0 ? (
                      <span className="rank-trophy rank-trophy--gold">
                        <Trophy size={16} /> 1
                      </span>
                    ) : index === 1 ? (
                      <span className="rank-trophy rank-trophy--silver">
                        <Trophy size={16} /> 2
                      </span>
                    ) : index === 2 ? (
                      <span className="rank-trophy rank-trophy--bronze">
                        <Trophy size={16} /> 3
                      </span>
                    ) : (
                      <span>{index + 1}</span>
                    )
                  ) : (
                    '-'
                  );

                  const isExpanded = expandedRows.includes(project.id);
                  const hasDetails = project.details && project.details.length > 0;

                  return (
                    <React.Fragment key={project.id}>
                      <tr 
                        className={rankClass} 
                        style={{ cursor: hasDetails ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (hasDetails) {
                            setExpandedRows(prev => prev.includes(project.id) ? prev.filter(id => id !== project.id) : [...prev, project.id]);
                          }
                        }}
                      >
                        <td className="standings-td standings-td--center">{rankDisplay}</td>
                        <td className="standings-td">
                          <div className="standings-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {project.team}
                            {hasDetails && (
                              <span style={{ fontSize: '10px', backgroundColor: 'var(--light-gray)', padding: '2px 6px', borderRadius: '4px' }}>
                                {project.details!.length} Judges {isExpanded ? '▼' : '▶'}
                              </span>
                            )}
                          </div>
                          <div className="standings-project">{project.name}</div>
                        </td>
                        {CRITERIA.map((c) => (
                          <td key={c.id} className="standings-td standings-td--center" style={{ fontWeight: 600, color: 'var(--dark)' }}>
                            {project.isEvaluated && project.scores && project.scores[c.id] !== undefined
                              ? Number(project.scores[c.id])
                              : '-'}
                          </td>
                        ))}
                        <td className="standings-td standings-td--center">
                          {project.isEvaluated ? (
                            <span className="score-pill">{project.totalScore.toFixed(2)}</span>
                          ) : (
                            <span className="score-pending">Pending</span>
                          )}
                        </td>
                        <td className="standings-td">
                          <div className="standings-comment" title={project.comment}>
                            {project.isEvaluated && project.comment ? project.comment : '-'}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td colSpan={1} />
                          <td colSpan={CRITERIA.length + 3} style={{ padding: '16px' }}>
                            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '12px', marginTop: 0 }}>Detailed Scores by Judge</h4>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)' }}>{t('dashboard.judgeName')}</th>
                                    {CRITERIA.map(c => <th key={c.id} style={{ textAlign: 'center', padding: '8px', color: 'var(--muted)' }}>{c.id.toUpperCase()}</th>)}
                                    <th style={{ textAlign: 'center', padding: '8px', color: 'var(--muted)' }}>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {project.details!.map((detail) => (
                                    <tr key={detail.username} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '8px', fontWeight: 500 }}>{detail.username}</td>
                                      {CRITERIA.map(c => (
                                        <td key={c.id} style={{ textAlign: 'center', padding: '8px' }}>
                                          {detail.scores[c.id] !== undefined ? detail.scores[c.id] : '-'}
                                        </td>
                                      ))}
                                      <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>{detail.total_score}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Judge Activity Section */}
      {activeTab === 'judges' && (
      <div className="standings-section animate-fade-in" style={{ marginTop: '32px' }}>
        <div className="standings-card">
          <div className="standings-header" style={{ backgroundColor: 'var(--dark)' }}>
            <h2 className="standings-title">
              <Play size={20} style={{ transform: 'rotate(90deg)' }} /> {t('dashboard.judgesTitle')}
            </h2>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.keys(evaluationsByJudge).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)' }}>{t('dashboard.noEvals')}</p>
            ) : (
              Object.entries(evaluationsByJudge).map(([judgeName, tasks]) => (
                <div key={judgeName} style={{ border: '1px solid var(--light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderBottom: '1px solid var(--light-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      👤 กรรมการ: {judgeName}
                    </h3>
                    <span style={{ fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--navy)', color: 'white', padding: '4px 10px', borderRadius: '12px' }}>
                      ประเมินแล้ว {tasks.length} โครงการ
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="standings-table" style={{ borderTop: 'none' }}>
                      <thead>
                        <tr className="standings-thead-row">
                          <th className="standings-th">Project</th>
                          {CRITERIA.map(c => <th key={c.id} className="standings-th standings-th--center">{c.id.toUpperCase()}</th>)}
                          <th className="standings-th standings-th--center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map(task => (
                          <tr key={task.project.id} className="standings-row">
                            <td className="standings-td" style={{ minWidth: '200px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--black)' }}>{task.project.team}</div>
                              <div style={{ fontSize: '12px', color: 'var(--dark)' }}>{task.project.name}</div>
                            </td>
                            {CRITERIA.map(c => (
                              <td key={c.id} className="standings-td standings-td--center">
                                {task.scores[c.id] !== undefined ? task.scores[c.id] : '-'}
                              </td>
                            ))}
                            <td className="standings-td standings-td--center">
                              <span className="score-pill" style={{ backgroundColor: 'var(--green)', color: 'white' }}>
                                {task.total.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

    </div>
  );
};

export default Dashboard;
