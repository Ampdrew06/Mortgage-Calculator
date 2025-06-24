import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import MC from './MC';
import CCC from './CCC';
import InfoPage from './InfoPage';
import CCCInfoPage from './CCCInfoPage';
import './App.css';

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isCCC = location.pathname.startsWith('/ccc');

  const themes = {
    mc: {
      primary: '#4caf50', // green
      secondary: '#1976d2', // blue
    },
    ccc: {
      primary: '#4aa4e3', // blue
      secondary: '#4caf50', // green
    }
  };

  const activeTheme = isCCC ? themes.ccc : themes.mc;
  const inactiveTheme = isCCC ? themes.mc : themes.ccc;

  const mainTitle = isCCC ? 'Credit Card Calculator' : 'Mortgage Calculator';
  const partnerTitle = isCCC ? 'Mortgage Calculator' : 'Credit Card Calculator';

  const goToPartner = () => {
    navigate(isCCC ? '/' : '/ccc');
  };

  const goToInfo = () => {
    navigate(isCCC ? '/ccc-info' : '/info');
  };

  return (
    <header
      style={{
        backgroundColor: activeTheme.primary,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderRadius: '8px 8px 0 0',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
      }}
    >
      <h1
        style={{
          fontSize: '1.8rem',
          margin: 0,
          flexGrow: 1,
          fontWeight: 'bold',
        }}
      >
        {mainTitle}
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={goToPartner}
          style={{
            backgroundColor: inactiveTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '0.4rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
          }}
          aria-label={`Switch to ${partnerTitle}`}
        >
          {partnerTitle}
        </button>

        <button
          onClick={goToInfo}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid white',
            color: 'white',
            borderRadius: '5px',
            padding: '0.3rem 0.75rem',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            lineHeight: 1,
          }}
          aria-label="Info"
          title="Info"
        >
          ℹ️
        </button>
      </div>
    </header>
  );
};

const App = () => {
  return (
    <Router>
      <HeaderNav />
      <Routes>
        <Route path="/" element={<MC />} />
        <Route path="/ccc" element={<CCC />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/ccc-info" element={<CCCInfoPage />} />
      </Routes>
    </Router>
  );
};

export default App;

