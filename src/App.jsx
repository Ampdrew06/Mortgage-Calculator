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

  const headerClass = `header ${isCCC ? 'blue-theme' : ''}`;
  const pageTitle = isCCC ? 'Credit Card Calculator' : 'Mortgage Calculator';

  const goToCalculator = () => {
    navigate(isCCC ? '/' : '/ccc');
  };

  const goToInfo = () => {
    navigate(isCCC ? '/ccc-info' : '/info');
  };

  return (
    <div className={headerClass}>
      <h1>{pageTitle}</h1>
      <div className="nav-buttons">
        <button className="share-btn" onClick={goToCalculator}>
          {isCCC ? 'Mortgage Calculator' : 'Credit Card Calculator'}
        </button>
        <button className="share-btn" onClick={goToInfo}>ℹ️</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <HeaderNav />
      <Routes>
        <Route path="/" element={<MortgageCalculator />} />
        <Route path="/ccc" element={<CCC />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/ccc-info" element={<CCCInfoPage />} />
      </Routes>
    </Router>
  );
};

export default App;
