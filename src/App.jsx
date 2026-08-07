import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomeownerFlow from './components/HomeownerFlow';
import ContractorDashboard from './components/ContractorDashboard';

import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { t, toggleLanguage, lang } = useLanguage();

  return (
    <Router>
      <div className="app-container">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/">{t('nav_homeowner')}</Link>
          <Link to="/contractor">{t('nav_contractor')}</Link>
          <div style={{ flex: 1 }}></div>
          <button onClick={toggleLanguage} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid #666', background: 'transparent' }}>
            {lang === 'en' ? '🇫🇷 FR' : '🇺🇸 EN'}
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<HomeownerFlow />} />
          <Route path="/contractor/*" element={<ContractorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
