import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const { t } = useLanguage();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ id, name, team })
      });
      const data = await res.json();
      
      if (data.success) {
        setId('');
        setName('');
        setTeam('');
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to add project');
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
        backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--light-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--navy)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={20} />
            Add Project
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ color: '#dc2626', marginBottom: '16px', fontSize: '14px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
              Project ID
            </label>
            <input 
              type="text" 
              required
              value={id}
              onChange={e => setId(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
              placeholder="e.g. PJ01"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
              Project Name
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
              Team Name
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
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? t('judge.saving') : 'Add Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
