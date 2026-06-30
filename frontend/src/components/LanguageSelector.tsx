import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px' }}>
      <button
        onClick={() => setLanguage('th')}
        style={{
          padding: '4px 12px',
          border: 'none',
          borderRadius: '16px',
          backgroundColor: language === 'th' ? 'var(--green)' : 'transparent',
          color: language === 'th' ? 'var(--navy)' : 'white',
          fontWeight: 700,
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        TH
      </button>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '4px 12px',
          border: 'none',
          borderRadius: '16px',
          backgroundColor: language === 'en' ? 'var(--green)' : 'transparent',
          color: language === 'en' ? 'var(--navy)' : 'white',
          fontWeight: 700,
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        EN
      </button>
    </div>
  );
}
