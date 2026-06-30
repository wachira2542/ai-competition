import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AddJudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddJudgeModal({ isOpen, onClose, onSuccess }: AddJudgeModalProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/judges', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setUsername('');
        setPassword('');
        onSuccess();
        onClose();
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
        backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--light-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--navy)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} />
            {t('admin.addJudge')}
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
              {t('login.password')}
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid var(--light-gray)', borderRadius: '4px', outlineColor: 'var(--green)' }}
              placeholder={t('login.password')}
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
            {loading ? t('judge.saving') : t('admin.addJudge')}
          </button>
        </form>
      </div>
    </div>
  );
}
