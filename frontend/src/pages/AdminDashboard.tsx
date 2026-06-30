import { useState, useEffect } from 'react';
import { useProjects, useEvaluations } from '../hooks/useEvaluations';
import { useActiveProject } from '../hooks/useActiveProject';
import Dashboard from '../components/Dashboard';
import JudgeProgressModal from '../components/JudgeProgressModal';
import AddJudgeModal from '../components/AddJudgeModal';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, UserPlus, Send, Trash2, Activity } from 'lucide-react';
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontWeight: 700, transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}
          >
            <UserPlus size={16} /> {t('admin.addJudge')}
          </button>
          <span>Admin: <strong>{user?.username}</strong></span>
          <LanguageSelector />
          <button 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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
            style={{ width: '100%', padding: '10px 16px', fontSize: '14px', border: '2px solid var(--light-gray)', borderRadius: '8px', backgroundColor: '#f8fafc', color: 'var(--navy)', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29, 54, 109, 0.1)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--light-gray)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Pushed!';
                btn.style.backgroundColor = 'var(--green)';
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.style.backgroundColor = 'var(--navy)';
                }, 2000);
              }
            }
          }}
          id="push-btn"
          style={{ padding: '10px 24px', backgroundColor: 'var(--navy)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}
        >
          <Send size={18} />
          {t('admin.pushToJudges')}
        </button>

        <button 
          onClick={() => setIsJudgeModalOpen(true)}
          style={{ padding: '10px 24px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}
        >
          <Activity size={18} />
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
                  window.location.reload();
                }
              } catch (e) {
                alert('Failed to clear data');
              }
            }
          }}
          style={{ padding: '10px 24px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Trash2 size={18} />
          {t('admin.clearData')}
        </button>
        
          <div style={{ marginLeft: 'auto', backgroundColor: 'rgba(45, 200, 77, 0.1)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(45, 200, 77, 0.3)', color: 'var(--navy)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeProjectId ? 'var(--green)' : 'var(--muted)' }}></span>
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
