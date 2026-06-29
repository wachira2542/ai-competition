import React from 'react';
import { Star, ClipboardList } from 'lucide-react';

interface HeaderProps {
  activeTab: 'score' | 'dashboard';
  onTabChange: (tab: 'score' | 'dashboard') => void;
  evaluatedCount: number;
  totalCount: number;
}

const Header: React.FC<HeaderProps> = ({ evaluatedCount, totalCount }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <Star size={22} />
          </div>
          <div>
            <h1 className="brand-title">
              AAPICO <span className="brand-accent">Judge</span>
            </h1>
            <p className="brand-subtitle">AI Innovation Competition</p>
          </div>
        </div>

        <div className="header-stats">
          <span className="stat-badge">
            <span className="stat-num">{evaluatedCount}</span>
            <span className="stat-sep">/</span>
            <span className="stat-total">{totalCount}</span>
            <span className="stat-label">Evaluated</span>
          </span>
        </div>

        <nav className="header-nav">
          <button
            id="tab-score"
            className="nav-btn nav-btn--active"
          >
            <ClipboardList size={18} />
            <span>Evaluation</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
