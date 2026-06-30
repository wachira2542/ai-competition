import { useState, useEffect } from 'react';
import { useProjects, useEvaluations } from '../hooks/useEvaluations';
import { useActiveProject } from '../hooks/useActiveProject';
import Dashboard from '../components/Dashboard';
import JudgeProgressModal from '../components/JudgeProgressModal';
import AddJudgeModal from '../components/AddJudgeModal';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, Users, UserPlus } from 'lucide-react';
import type { RevealState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { projects, loading: projectsLoading } = useProjects();
  const { evaluations, refetch } = useEvaluations();
  const { activeProjectId, pushedProjects, setActive, loading: activeLoading } = useActiveProject();
  const { logout, user } = useAuth();
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [dashboardState, setDashboardState] = useState<RevealState>('idle');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isAddJudgeModalOpen, setIsAddJudgeModalOpen] = useState(false);

  useEffect(() => {
    if (activeProjectId && !selectedProject) {
      setSelectedProject(activeProjectId);
    }
  }, [activeProjectId, selectedProject]);

  // Poll evaluations every 5 seconds for real-time dashboard updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSetActive = async () => {
    return await setActive(selectedProject || null);
  };

  if (projectsLoading || activeLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Admin Header */}
      <header style={{ backgroundColor: 'var(--navy)', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={24} color="var(--green)" />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{t('admin.title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          {dashboardState !== 'idle' && (
            <button 
              onClick={() => setResetTrigger(prev => prev + 1)}
              style={{ padding: '6px 14px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔄 {t('admin.backToMain')}
            </button>
          )}
          <button 
            onClick={() => setIsAddJudgeModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 700 }}
          >
            <UserPlus size={16} /> {t('admin.addJudge')}
          </button>
          <span>Admin: <strong>{user?.username}</strong></span>
          <LanguageSelector />
          <button 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
          >
            <LogOut size={16} /> {t('admin.logout')}
          </button>
        </div>
      </header>

      {/* Admin Controls */}
      {dashboardState === 'idle' && (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--light-gray)', padding: '20px 24px', display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>

          <div style={{ flex: 1, maxWidth: '400px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t('admin.setActiveProject')}
          </label>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)' }}
          >
            <option value="">{t('admin.waiting')}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {pushedProjects.includes(p.id) ? '✓ ' : ''}{p.id}: {p.name}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={async () => {
            const ok = await handleSetActive();
            if (ok) {
              const btn = document.getElementById('push-btn');
              if (btn) {
                const originalText = btn.innerText;
                btn.innerText = '✅ Pushed!';
                btn.style.backgroundColor = 'var(--green)';
                setTimeout(() => {
                  btn.innerText = originalText;
                  btn.style.backgroundColor = 'var(--navy)';
                }, 2000);
              }
            }
          }}
          id="push-btn"
          style={{ padding: '10px 24px', backgroundColor: 'var(--navy)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.3s', borderRadius: '4px' }}
        >
          {t('admin.pushToJudges')}
        </button>

        <button 
          onClick={() => setIsJudgeModalOpen(true)}
          style={{ padding: '10px 24px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.3s', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} />
          {t('admin.viewJudgeProgress')}
        </button>
        
        <button 
          onClick={async () => {
            if (window.confirm(t('admin.clearConfirm'))) {
              try {
                const res = await fetch('/api/admin/clear-evaluations', {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const json = await res.json();
                if (json.success) {
                  alert('All data cleared successfully.');
                  refetch(); // Reload data
                  // force full page reload to clear pushed states cleanly
                  window.location.reload();
                }
              } catch (e) {
                alert('Failed to clear data');
              }
            }
          }}
          style={{ padding: '10px 24px', backgroundColor: '#dc2626', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
        >
          {t('admin.clearData')}
        </button>
        
          <div style={{ marginLeft: 'auto', backgroundColor: '#e3f2fd', padding: '10px 16px', borderRadius: '4px', border: '1px solid #bbdefb', color: '#1565c0', fontSize: '14px' }}>
            {t('admin.currentlyActive')}: <strong>{activeProjectId ? activeProjectId : t('admin.none')}</strong>
          </div>
        </div>
      )}

      {/* Dashboard Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Dashboard projects={projects} evaluations={evaluations} onRevealChange={setDashboardState} resetTrigger={resetTrigger} />
      </div>

      {/* Judge Progress Modal */}
      <JudgeProgressModal 
        isOpen={isJudgeModalOpen} 
        onClose={() => setIsJudgeModalOpen(false)} 
        projects={projects} 
        evaluations={evaluations} 
        activeProjectId={activeProjectId} 
      />

      {/* Add Judge Modal */}
      <AddJudgeModal
        isOpen={isAddJudgeModalOpen}
        onClose={() => setIsAddJudgeModalOpen(false)}
        onSuccess={() => {
          alert('Judge added successfully!');
          // Any other logic can go here (e.g. refetching if we displayed judges directly on this page)
        }}
      />
    </div>
  );
}
