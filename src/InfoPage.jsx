import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <div className="header-buttons">
          <button className="share-btn blue-btn">Share</button>
          <button className="share-btn back-btn" onClick={onBack} title="Back to Calculator">← Back</button>
        </div>
      </div>

      <div className="info-page">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><span>Loan Amount (£):</span> The total mortgage you’re borrowing.</li>
          <li><span>Loan Term (Years):</span> Total length of your mortgage.</li>
          <li><span>Initial Rate (%):</span> Introductory interest rate.</li>
          <li><span>Fixed Term (Years):</span> Time the fixed rate lasts (if any).</li>
          <li><span>Secondary Rate (%):</span> The rate after the fixed term ends.</li>
          <li><span>Overpayment (£):</span> Optional extra payment to decrease loan term.</li>
          <li><span>Target (Years):</span> Enter a goal if you want to repay early.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li>
            <span>Monthly Payment:</span><br />
            Your monthly cost during the fixed term, including overpayments.
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
            Balance still owed after the fixed term.
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
