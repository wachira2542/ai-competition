import { useState, useEffect } from 'react';
import { useProjects, useEvaluations } from '../hooks/useEvaluations';
import { useActiveProject } from '../hooks/useActiveProject';
import { useCriteria } from '../hooks/useCriteria';
import type { ScoreMap } from '../types';
import Header from '../components/Header';
import ScoringForm from '../components/ScoringForm';
import SaveModal from '../components/SaveModal';
import JudgeSummaryTable from '../components/JudgeSummaryTable';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function EvaluatePage() {
  const { t } = useLanguage();
  const CRITERIA = useCriteria();
  const { projects, loading: projectsLoading } = useProjects();
  const { evaluations, saveEvaluation } = useEvaluations();
  const { activeProjectId, pushedProjects, loading: activeLoading } = useActiveProject();
  const { logout, user } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentScores, setCurrentScores] = useState<ScoreMap>({});
  const [currentComment, setCurrentComment] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Track the last pushed project so we know when admin changes it
  const [lastPushedProject, setLastPushedProject] = useState<string | null>(null);

  // Determine which project to show
  // Force switch when admin changes the active project
  useEffect(() => {
    if (activeProjectId && activeProjectId !== lastPushedProject) {
      setSelectedProjectId(activeProjectId);
      setLastPushedProject(activeProjectId);
    } else if (!selectedProjectId && activeProjectId) {
      setSelectedProjectId(activeProjectId);
    }
  }, [activeProjectId, lastPushedProject, selectedProjectId]);

  // Load scores when switching project
  useEffect(() => {
    if (!selectedProjectId) return;
    const evalData = evaluations[selectedProjectId];
    if (evalData) {
      setCurrentScores(evalData.scores || {});
      setCurrentComment(evalData.comment || '');
    } else {
      const init: ScoreMap = {};
      CRITERIA.forEach((c) => (init[c.id] = 0));
      setCurrentScores(init);
      setCurrentComment('');
    }
  }, [selectedProjectId, evaluations]);

  const handleScoreChange = (criteriaId: string, value: string) => {
    setCurrentScores((prev) => ({ ...prev, [criteriaId]: value }));
  };

  const handleSave = async () => {
    if (!selectedProjectId) return;
    setSaving(true);
    const ok = await saveEvaluation(selectedProjectId, currentScores, currentComment);
    setSaving(false);
    if (ok) {
      setShowSaveModal(true);
      setTimeout(() => setShowSaveModal(false), 2000);
    }
  };

  const evaluatedCount = Object.keys(evaluations).length;

  if (projectsLoading || activeLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Filter projects to only show: Active project OR already evaluated projects (so they can be edited)
  const availableProjects = projects.filter(
    (p) => p.id === activeProjectId || evaluations[p.id] || pushedProjects.includes(p.id)
  );

  return (
    <div className="app-root">
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .waiting-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 72px); background-color: var(--light-gray); }
        .waiting-box { background: white; padding: 40px; border-radius: 8px; box-shadow: var(--shadow-md); text-align: center; }
      `}</style>

      <SaveModal visible={showSaveModal} />

      <Header
        activeTab="score"
        onTabChange={() => {}}
        evaluatedCount={evaluatedCount}
        totalCount={projects.length}
      />
      
      <div style={{ backgroundColor: 'var(--navy)', color: 'white', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
        <div>{t('dashboard.judgeName')}: <strong>{user?.username}</strong></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageSelector />
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '4px 12px', cursor: 'pointer' }}>{t('judge.logout')}</button>
        </div>
      </div>

      <JudgeSummaryTable projects={projects} evaluations={evaluations} />

      <main className="app-main">
        {!selectedProjectId && !activeProjectId && Object.keys(evaluations).length === 0 ? (
          <div className="waiting-screen">
            <div className="waiting-box">
              <Clock size={48} color="var(--blue)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '8px' }}>{t('judge.waiting')}</h2>
            </div>
          </div>
        ) : (
          <ScoringForm
            projects={availableProjects}
            evaluations={evaluations}
            pushedProjects={pushedProjects}
            selectedProjectId={selectedProjectId || ''}
            currentScores={currentScores}
            currentComment={currentComment}
            saving={saving}
            onProjectChange={setSelectedProjectId}
            onScoreChange={handleScoreChange}
            onCommentChange={setCurrentComment}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
