import { useState, useEffect } from 'react';
import { X, UserPlus, Edit, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Judge {
  id: number;
  username: string;
}

interface AddJudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddJudgeModal({ isOpen, onClose, onSuccess }: AddJudgeModalProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [judges, setJudges] = useState<Judge[]>([]);
  
  const [id, setId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJudges = async () => {
    try {
      const res = await fetch('/api/admin/judges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setJudges(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch judges');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJudges();
      setView('list');
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setId(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleAddNew = () => {
    resetForm();
    setIsEditing(false);
    setView('form');
  };

  const handleEdit = (judge: Judge) => {
    resetForm();
    setId(judge.id);
    setUsername(judge.username);
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (judgeId: number) => {
    if (!window.confirm('Are you sure you want to delete this judge? All related evaluations will also be deleted.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/judges/${judgeId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      
      if (data.success) {
        fetchJudges();
        onSuccess();
      } else {
        alert(data.message || 'Failed to delete judge');
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
      const url = isEditing ? `/api/admin/judges/${id}` : '/api/admin/judges';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        fetchJudges();
        onSuccess();
        setView('list');
      } else {
        setError(data.message || t('admin.failedToAdd'));
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
            <UserPlus size={20} />
            Judge Management
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
                <h3 style={{ margin: 0, color: 'var(--navy)' }}>All Judges ({judges.length})</h3>
                <button 
                  onClick={handleAddNew}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--green)', color: 'var(--navy)', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Plus size={16} /> Add New Judge
                </button>
              </div>
              
              <div style={{ border: '1px solid var(--light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--navy)' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--navy)' }}>Username</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'var(--navy)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--light-gray)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{j.id}</td>
                        <td style={{ padding: '12px' }}>{j.username}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleEdit(j)} style={{ background: 'transparent', border: 'none', color: 'var(--navy)', cursor: 'pointer', marginRight: '8px' }} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(j.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {judges.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                          No judges found.
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
                <h3 style={{ margin: 0, color: 'var(--navy)' }}>{isEditing ? 'Edit Judge' : 'Add New Judge'}</h3>
                <button 
                  type="button"
                  onClick={() => setView('list')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--navy)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                >
                  Back to List
                </button>
              </div>

              {error && (
                <div style={{ color: '#dc2626', marginBottom: '16px', fontSize: '14px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                  {error}
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                  {t('login.username')}
                </label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
                  placeholder={t('login.username')}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                  {isEditing ? 'New Password (leave blank to keep current)' : t('login.password')}
                </label>
                <input 
                  type="password" 
                  required={!isEditing}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
                  placeholder={isEditing ? 'Enter new password' : t('login.password')}
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
                {loading ? t('judge.saving') : (isEditing ? 'Save Changes' : t('admin.addJudge'))}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
