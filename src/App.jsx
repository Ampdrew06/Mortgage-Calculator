import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import MC from './MC';
import CCC from './CCC';
import InfoPage from './InfoPage';
import CCCInfoPage from './CCCInfoPage';
import './App.css';

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isCCC = location.pathname.startsWith('/ccc');

  const green = '#4caf50';
  const blue = '#4aa4e3';
  const grey = '#ddd';
  const darkText = '#333';

  return (
    <header
      style={{
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
        borderBottom: '2px solid #ccc',
        borderRadius: '8px 8px 0 0',
      }}
    >
      <nav style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: isCCC ? grey : green,
            color: isCCC ? darkText : 'white',
            fontWeight: isCCC ? 'normal' : 'bold',
            borderRadius: '8px 8px 0 0',
            padding: '0.5rem 1.25rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isCCC ? 'none' : `0 2px 6px ${green}88`,
            transition: 'background-color 0.3s',
          }}
          aria-current={isCCC ? undefined : 'page'}
        >
          Mortgage Calculator
        </button>
        <button
          onClick={() => navigate('/ccc')}
          style={{
            backgroundColor: isCCC ? blue : grey,
            color: isCCC ? 'white' : darkText,
            fontWeight: isCCC ? 'bold' : 'normal',
            borderRadius: '8px 8px 0 0',
            padding: '0.5rem 1.25rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isCCC ? `0 2px 6px ${blue}88` : 'none',
            transition: 'background-color 0.3s',
          }}
          aria-current={isCCC ? 'page' : undefined}
        >
          Credit Card Calculator
        </button>
      </nav>

      <button
        onClick={() => navigate(isCCC ? '/ccc-info' : '/info')}
        title="Info"
        aria-label="Info"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #666',
          color: '#666',
          borderRadius: '5px',
          padding: '0.3rem 0.75rem',
          fontSize: '1.1rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: 1,
          userSelect: 'none',
          transition: 'color 0.3s, border-color 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = isCCC ? blue : green;
          e.currentTarget.style.borderColor = isCCC ? blue : green;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#666';
          e.currentTarget.style.borderColor = '#666';
        }}
      >
        ℹ️
      </button>
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
        {/* Catch-all: redirect any unknown route to MC page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
