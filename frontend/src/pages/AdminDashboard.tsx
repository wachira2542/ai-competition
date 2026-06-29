import { useState, useEffect } from 'react';
import { useProjects, useEvaluations } from '../hooks/useEvaluations';
import { useActiveProject } from '../hooks/useActiveProject';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { projects, loading: projectsLoading } = useProjects();
  const { evaluations, refetch } = useEvaluations();
  const { activeProjectId, pushedProjects, setActive, loading: activeLoading } = useActiveProject();
  const { logout, user } = useAuth();
  
  const [selectedProject, setSelectedProject] = useState<string>('');

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
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>AAPICO Judge Admin</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          <span>Admin: <strong>{user?.username}</strong></span>
          <button 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Admin Controls */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--light-gray)', padding: '20px 24px', display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <button 
          onClick={async () => {
            if (window.confirm('Are you sure you want to CLEAR ALL evaluation data? This cannot be undone!')) {
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
          Clear Data
        </button>

        <div style={{ flex: 1, maxWidth: '400px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Set Active Project for Judges
          </label>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)' }}
          >
            <option value="">-- None (Waiting) --</option>
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
          Push to Judges Screen
        </button>
        
        <div style={{ marginLeft: 'auto', backgroundColor: '#e3f2fd', padding: '10px 16px', borderRadius: '4px', border: '1px solid #bbdefb', color: '#1565c0', fontSize: '14px' }}>
          Currently Active: <strong>{activeProjectId ? activeProjectId : 'None'}</strong>
        </div>
      </div>

      {/* Dashboard Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Dashboard projects={projects} evaluations={evaluations} />
      </div>
    </div>
  );
}
