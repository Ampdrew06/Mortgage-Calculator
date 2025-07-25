import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import MC from './MC';
import InfoPage from './InfoPage';
import './App.css';

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const green = '#4caf50';

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
            backgroundColor: green,
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '8px 8px 0 0',
            padding: '0.5rem 1.25rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 2px 6px ${green}88`,
            transition: 'background-color 0.3s',
          }}
        >
          Mortgage Calculator
        </button>
      </nav>

      <button
        onClick={() => navigate('/info')}
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
          e.currentTarget.style.color = green;
          e.currentTarget.style.borderColor = green;
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
        <Route path="/info" element={<InfoPage />} />
      </Routes>
    </Router>
  );
};

export default App;
