import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      
      if (json.success) {
        login(json.data.token, json.data.user);
        if (json.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/evaluate');
        }
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--navy)' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'var(--white)', padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'var(--navy)', color: 'var(--white)', padding: '16px', marginBottom: '16px' }}>
            <Trophy size={48} color="var(--green)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AAPICO AI Judge</h2>
          <p style={{ color: 'var(--dark)', fontSize: '14px', marginTop: '4px' }}>Please login to continue</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', fontSize: '13px', fontWeight: 600, borderLeft: '4px solid #c62828' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '14px', border: '2px solid var(--light-gray)', fontSize: '15px', outline: 'none' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', border: '2px solid var(--light-gray)', fontSize: '15px', outline: 'none' }}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '16px', backgroundColor: 'var(--green)', color: 'var(--black)', border: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '15px', marginTop: '10px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
