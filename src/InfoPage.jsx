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
          <li><strong>Initial Rate (%):</strong> Introductory interest rate.</li>
          <li><strong>Fixed Term (Years):</strong> How long the fixed rate lasts.</li>
          <li><strong>Secondary Rate (%):</strong> What your rate changes to after the fixed period.</li>
          <li><strong>Overpayment (£):</strong> Optional – monthly extra payment to shorten your term.</li>
          <li><strong>Target Years:</strong> Optional – enter a goal if you want to repay early.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li><strong>Initial Monthly Payment:</strong> What you pay during the fixed rate period.</li>
          <li><strong>Secondary Monthly Payment:</strong> What you’ll pay after the fixed term ends.</li>
          <li><strong>Years Remaining:</strong> If you overpay, this estimates how many years it could save.</li>
          <li><strong>Remaining Balance After Fixed Term:</strong> If your rate changes, this is what will be left.</li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is a <strong>forecasting tool</strong> for illustration purposes only. It’s not financial advice.
          Please consult a qualified financial advisor or mortgage broker before making any major decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;
