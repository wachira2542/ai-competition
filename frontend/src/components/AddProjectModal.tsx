import { useState } from 'react';
import { X, FolderPlus, Edit, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Project } from '../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
}

export default function AddProjectModal({ isOpen, onClose, onSuccess, projects }: AddProjectModalProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setId('');
    setName('');
    setTeam('');
    setError('');
  };

  const handleAddNew = () => {
    resetForm();
    setIsEditing(false);
    setView('form');
  };

  const handleEdit = (project: Project) => {
    resetForm();
    setId(project.id);
    setName(project.name);
    setTeam(project.team);
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? All related evaluations will also be deleted.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      
      if (data.success) {
        onSuccess(); // Refresh projects
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (err) {
      alert(t('admin.networkError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditing ? `/api/admin/projects/${id}` : '/api/admin/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ id, name, team })
      });
      const data = await res.json();
      
      if (data.success) {
        onSuccess();
        setView('list');
      } else {
        setError(data.message || 'Failed to save project');
      }
    } catch (err) {
      setError(t('admin.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--light-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--navy)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={20} />
            จัดการโปรเจค (Project Management)
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {view === 'list' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--navy)' }}>โปรเจคทั้งหมด ({projects.length})</h3>
                <button 
                  onClick={handleAddNew}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Plus size={16} /> เพิ่มโปรเจคใหม่
                </button>
              </div>
              
              <div style={{ border: '1px solid var(--light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--navy)' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--navy)' }}>ชื่อโปรเจค (Name)</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--navy)' }}>ชื่อทีม (Team)</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'var(--navy)' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--light-gray)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{p.id}</td>
                        <td style={{ padding: '12px' }}>{p.name}</td>
                        <td style={{ padding: '12px' }}>{p.team}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: 'var(--navy)', cursor: 'pointer', marginRight: '8px' }} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                          ไม่พบข้อมูลโปรเจค
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--navy)' }}>{isEditing ? 'แก้ไขโปรเจค (Edit Project)' : 'เพิ่มโปรเจคใหม่ (Add New Project)'}</h3>
                <button 
                  type="button"
                  onClick={() => setView('list')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--navy)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                >
                  กลับไปหน้ารายการ
                </button>
              </div>

              {error && (
                <div style={{ color: '#dc2626', marginBottom: '16px', fontSize: '14px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                  {error}
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                  รหัสโปรเจค (Project ID)
                </label>
                <input 
                  type="text" 
                  required
                  disabled={isEditing}
                  value={id}
                  onChange={e => setId(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)', backgroundColor: isEditing ? '#f1f5f9' : 'white' }}
                  placeholder="e.g. PJ01"
                />
                {isEditing && <small style={{ color: 'var(--muted)' }}>รหัสโปรเจคไม่สามารถแก้ไขได้</small>}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                  ชื่อโปรเจค (Project Name)
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
                  placeholder="Enter project name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                  ชื่อทีม (Team Name)
                </label>
                <input 
                  type="text" 
                  required
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
                  placeholder="Enter team name"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', padding: '12px', backgroundColor: 'var(--green)', color: 'var(--navy)', 
                  border: 'none', fontWeight: 700, borderRadius: '4px', fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  transition: 'transform 0.1s'
                }}
              >
                {loading ? t('judge.saving') : (isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มโปรเจค')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
