import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const InfoPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mortgage Calculator',
        text: 'Check out this Mortgage Calculator app!',
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  return (
    <div className="info-page full-width-info">
      <h1>Info & Disclaimer</h1>

      <div className="header-buttons" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className="back-btn"
          style={{
            flex: 1,
            backgroundColor: '#4caf50', // green
            color: 'white',
            padding: '0.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={handleBack}
          title="Back to Calculator"
        >
          ← Back to Calculator
        </button>
        <button
          className="share-btn"
          style={{
            flex: 1,
            backgroundColor: '#4aa4e3', // blue
            color: 'white',
            padding: '0.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={handleShare}
        >
          Share
        </button>
      </div>

      <h2>How to Use This Calculator</h2>
      <ul>
        <li><span>Loan Amount (£):</span> The total mortgage you’re borrowing.</li>
        <li><span>Loan Term (Years):</span> Total length of your mortgage.</li>
        <li><span>Initial Rate (%):</span> Introductory interest rate.</li>
        <li><span>Fixed Term (Years):</span> Time the fixed rate lasts (if any).</li>
        <li><span>Secondary Rate (%):</span> The rate after the fixed term ends.</li>
        <li>
          <span>Overpayment (£):</span> Optional <strong>regular monthly overpayments</strong> to decrease loan term.
          <br />
          <em>Note: Lump sum overpayments are not supported currently.</em>
        </li>
        <li><span>Target (Years):</span> Enter a goal if you want to repay early.</li>
      </ul>

      <h2>Results Explained</h2>
      <ul>
        <li>
          <span>Monthly Payment:</span><br />
          Your monthly cost, including any overpayments (if any).
        </li>
        <li>
          <span>Secondary Monthly Payment:</span><br />
          What you’ll pay after the fixed term ends, if applicable.
        </li>
        <li>
          <span>Time to Complete Mortgage:</span><br />
          Total duration required to repay the loan.
        </li>
        <li>
          <span>Remaining Balance After Fixed Term:</span><br />
          Balance still owed after the fixed term, if applicable.
        </li>
        <li>
          <span>Interest vs Principal Chart:</span><br />
          The pie chart shows how much of your total repayment goes toward interest (red) vs principal (green). Tap either colour to reveal the exact amount.
        </li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        This calculator is a <strong>forecasting tool</strong> for illustrative purposes only.
        It is not financial advice. Always consult a qualified mortgage advisor before making decisions.
      </p>

      {/* New fees disclaimer */}
      <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>
        <strong>Note:</strong> This calculation <em>does not</em> include broker fees, solicitor fees, valuation fees, insurance, or any other related costs.
      </p>
    </div>
  );
};

export default InfoPage;
