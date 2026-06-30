import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

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
    <div className="login-page-container">
      {/* ══════════ LEFT HERO PANEL ══════════ */}
      <div className="hero-panel">
        <div className="hero-accent-bar"></div>

        {/* Logo */}
        <div className="hero-logo">
          <div className="hero-logo-icon">
            <i className="fa-solid fa-laptop-code"></i>
          </div>
          <div className="hero-logo-text">
            <strong>AAPICO</strong>
            <span>Judge</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            AI Innovation Competition 2026
          </div>

          <h1 className="hero-headline">
            AAPICO<br /><em>Judge</em>
          </h1>

          <p className="hero-sub">
            ระบบประเมินผลและให้คะแนนการแข่งขัน AI Innovation ประจำปี 2026
          </p>

          <div className="hero-features">
            <div className="hero-feature-item">
              <i className="fa-solid fa-star"></i>
              <span>ระบบประเมินผลและให้คะแนนแบบเรียลไทม์</span>
            </div>
            <div className="hero-feature-item">
              <i className="fa-solid fa-chart-pie"></i>
              <span>Dashboard ติดตามคะแนน Real-time</span>
            </div>
            <div className="hero-feature-item">
              <i className="fa-solid fa-shield-halved"></i>
              <span>เข้าสู่ระบบปลอดภัยด้วยบัญชีผู้ใช้ระบบ</span>
            </div>
            <div className="hero-feature-item">
              <i className="fa-solid fa-users"></i>
              <span>จัดการโครงการและทีมผู้เข้าแข่งขันได้อย่างง่ายดาย</span>
            </div>
          </div>
        </div>

        <div className="hero-badge">
          <span className="hero-badge-label">Powered by</span>
          <span className="hero-badge-value">AAPICO</span>
        </div>
      </div>

      {/* ══════════ RIGHT FORM PANEL ══════════ */}
      <div className="form-panel">
        <div className="form-inner">
          <div className="form-header">
            <div className="form-system-tag">
              <i className="fa-solid fa-circle-dot"></i>
              AAPICO Judge — Secure Login
            </div>
            <h2 className="form-title">เข้าสู่ระบบ</h2>
            <p className="form-subtitle">
              กรุณาใช้ข้อมูลบัญชีผู้ใช้งานระบบ (Username และ Password) เพื่อเข้าใช้งาน
            </p>
          </div>

          {/* Info Banner */}
          <div className="form-info-banner">
            <i className="fa-solid fa-building"></i>
            <div className="form-info-banner-text">
              <strong>ระบบประเมินผล AI Innovation Competition 2026</strong>
              <small>สำหรับคณะกรรมการที่ได้รับอนุญาตเท่านั้น · Authorized Judges Only</small>
            </div>
          </div>

          {/* Login Form */}
          <form id="login-form" className="login-form" autoComplete="off" noValidate onSubmit={handleLogin}>
            <div className="field-group">
              <label htmlFor="login-username">ชื่อผู้ใช้ (Username)</label>
              <div className="field-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  id="login-username"
                  type="text"
                  className="field-input"
                  placeholder="ชื่อผู้ใช้งานของคุณ"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="login-password">รหัสผ่าน (Password)</label>
              <div className="field-input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  id="login-password"
                  type="password"
                  className="field-input"
                  placeholder="รหัสผ่านของคุณ"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div id="login-error" className="login-error">
              {error && <><i className="fa-solid fa-circle-exclamation"></i> {error}</>}
            </div>

            <button type="submit" className="btn-submit" id="login-submit-btn" disabled={loading}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <p>กรุณาใช้บัญชีผู้ใช้งานที่ได้รับจากระบบเพื่อเข้าสู่ระบบ</p>
            <p>หากพบปัญหา หรือลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ (Admin)</p>
            <div className="form-footer-brand">
              <div className="form-footer-dot"></div>
              <span>AAPICO HITECH Co., Ltd.</span>
              <div className="form-footer-dot"></div>
              <span>IT Department</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
