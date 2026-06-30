import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TableProperties } from 'lucide-react';
import type { Project, Evaluation } from '../types';
import { useCriteria } from '../hooks/useCriteria';
import { useLanguage } from '../context/LanguageContext';

interface JudgeSummaryTableProps {
  projects: Project[];
  evaluations: Record<string, Evaluation>;
}

const JudgeSummaryTable: React.FC<JudgeSummaryTableProps> = ({ projects, evaluations }) => {
  const { t } = useLanguage();
  const CRITERIA = useCriteria();
  const [isOpen, setIsOpen] = useState(false);

  const evaluatedProjects = projects.filter(p => evaluations[p.id]);

  return (
    <div style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--light-gray)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          backgroundColor: isOpen ? 'var(--bg)' : 'rgba(45, 200, 77, 0.15)', border: 'none', borderBottom: isOpen ? '1px solid var(--light-gray)' : 'none',
          cursor: 'pointer', transition: 'all 0.3s', outline: 'none'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = isOpen ? 'var(--light-gray)' : 'rgba(45, 200, 77, 0.25)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = isOpen ? 'var(--bg)' : 'rgba(45, 200, 77, 0.15)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)', fontWeight: 700, fontSize: '16px' }}>
          <TableProperties size={20} color={isOpen ? "var(--navy)" : "var(--green)"} />
          {t('judge.summaryTitle')}
          {!isOpen && (
            <span className="animate-pulse-slight" style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 600, opacity: 0.8, marginLeft: '12px' }}>
              {t('judge.summaryClick')}
            </span>
          )}
        </div>
        <div style={{ color: 'var(--navy)' }}>
          {isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '24px', overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
          {evaluatedProjects.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px', padding: '20px' }}>
              {t('dashboard.noEvals')}
            </p>
          ) : (
            <table className="standings-table" style={{ border: '2px solid var(--navy)' }}>
              <thead className="standings-thead-row" style={{ backgroundColor: 'var(--navy)', color: 'white' }}>
                <tr>
                  <th className="standings-th" style={{ color: 'white' }}>{t('dashboard.standingsTeam')}</th>
                  <th className="standings-th" style={{ color: 'white' }}>Project Name</th>
                  {CRITERIA.map((c) => (
                    <th key={c.id} className="standings-th standings-th--center" style={{ color: 'white', whiteSpace: 'normal', minWidth: '120px' }}>
                      {c.name}<br/>(Max {c.maxScore})
                    </th>
                  ))}
                  <th className="standings-th standings-th--center" style={{ color: 'var(--gold)' }}>{t('dashboard.standingsTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedProjects.map((p) => {
                  const ev = evaluations[p.id];
                  const scores = ev.scores;
                  return (
                    <tr key={p.id} className="standings-row">
                      <td className="standings-td"><strong>{p.team}</strong></td>
                      <td className="standings-td" style={{ fontSize: '13px' }}>{p.name}</td>
                      {CRITERIA.map((c) => {
                        const score = Number(scores[c.id]) || 0;
                        return (
                          <td key={c.id} className="standings-td standings-th--center">
                            {score}
                          </td>
                        );
                      })}
                      <td className="standings-td standings-th--center" style={{ fontWeight: 700, color: 'var(--navy)', backgroundColor: 'rgba(29, 54, 109, 0.05)' }}>
                        {ev.total_score.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgeSummaryTable;
