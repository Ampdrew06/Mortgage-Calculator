import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container info-page">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <div className="header-buttons">
          <button className="share-btn blue-btn" title="Share App">Share</button>
          <button className="share-btn back-btn" onClick={onBack} title="Back to Calculator">
            ← Back
          </button>
        </div>
      </div>

      <div className="info-content">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li>
            <span className="info-label">Loan Amount (£):</span>
            <span className="info-desc">The total mortgage you’re borrowing.</span>
          </li>
          <li>
            <span className="info-label">Loan Term (Years):</span>
            <span className="info-desc">Total length of your mortgage.</span>
          </li>
          <li>
            <span className="info-label">Initial Rate (%):</span>
            <span className="info-desc">Introductory interest rate.</span>
          </li>
          <li>
            <span className="info-label">Fixed Term (Years):</span>
            <span className="info-desc">How long the fixed rate lasts (if any).</span>
          </li>
          <li>
            <span className="info-label">Secondary Rate (%):</span>
            <span className="info-desc">Your rate after the fixed term ends.</span>
          </li>
          <li className="multi-line">
            <span className="info-label">Overpayment (£):</span>
            <span className="info-desc">
              Optional monthly extra payment.
              <ul className="sub-points">
                <li>With fixed term & secondary rate: applies only during the fixed period.</li>
                <li>Basic setup: applies throughout the term.</li>
              </ul>
            </span>
          </li>
          <li>
            <span className="info-label">Target (Years):</span>
            <span className="info-desc">
              Enter a goal if you want to repay early. Overrides other inputs.
            </span>
          </li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li>
            <span className="info-label">Monthly Payment:</span>
            <span className="info-desc">Your monthly cost during the fixed term, including any overpayments.</span>
          </li>
          <li>
            <span className="info-label">Secondary Monthly Payment:</span>
            <span className="info-desc">Payment after the fixed term ends, if applicable.</span>
          </li>
          <li>
            <span className="info-label">Time to Complete Mortgage:</span>
            <span className="info-desc">Total duration required to repay the loan.</span>
          </li>
          <li>
            <span className="info-label">Remaining Balance After Fixed Term:</span>
            <span className="info-desc">Balance still owed after the fixed term.</span>
          </li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is a <strong>forecasting tool</strong> for illustrative purposes only.
          It is not financial advice. Always consult a qualified mortgage advisor before making decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;
