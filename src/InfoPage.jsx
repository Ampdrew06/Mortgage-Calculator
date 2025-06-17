import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <button
          className="share-btn"
          onClick={onBack}
          title="Back to Calculator"
        >
          ← Back
        </button>
      </div>

      <div className="info-section">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><strong>Loan Amount (£):</strong> The total mortgage you’re borrowing.</li>
          <li><strong>Loan Term (Years):</strong> Total length of your mortgage.</li>
          <li><strong>Initial Rate (%):</strong> The interest rate during the initial fixed period.</li>
          <li><strong>Fixed Term (Years):</strong> How long the initial rate applies.</li>
          <li><strong>Secondary Rate (%):</strong> The rate that applies after the fixed term ends.</li>
          <li><strong>Overpayment (£):</strong> Optional – monthly extra payment to shorten your term.</li>
          <li><strong>Target Years:</strong> Optional – enter a goal if you want to repay early.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li><strong>Initial Monthly Payment:</strong> What you pay during the fixed-rate period.</li>
          <li><strong>Secondary Monthly Payment:</strong> What you’ll pay after the fixed term (if balance remains).</li>
          <li><strong>Years Remaining:</strong> Estimated time to repay the mortgage based on overpayments or target.</li>
          <li><strong>Remaining Balance After Fixed Term:</strong> If the mortgage isn’t repaid during the fixed period, this is what’s left.</li>
          <li><strong>Pie Chart:</strong> Shows how much of your total repayment goes to interest (red) vs. principal (green).</li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is a <strong>forecasting tool</strong> for illustration purposes only. It’s not financial advice.
          Always consult a qualified mortgage advisor or broker before making decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;
