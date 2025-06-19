import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container info-page">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <div className="header-buttons">
          <button className="share-btn blue-btn" title="Share App">Share</button>
          <button className="share-btn back-btn" onClick={onBack} title="Back to Calculator">← Back</button>
        </div>
      </div>

      <div className="info-section">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><strong>Loan Amount (£):</strong> The total mortgage you’re borrowing.</li>
          <li><strong>Loan Term (Years):</strong> Total length of your mortgage.</li>
          <li><strong>Initial Rate (%):</strong> Introductory interest rate.</li>
          <li><strong>Fixed Term (Years):</strong> How long the fixed rate lasts (if any).</li>
          <li><strong>Secondary Rate (%):</strong> Your rate after the fixed term ends.</li>
          <li><strong>Overpayment (£):</strong> Optional monthly extra payment.
            <ul className="sub-points">
              <li>• With fixed term & secondary rate: applies only during fixed period.</li>
              <li>• Basic setup: applies throughout the term.</li>
            </ul>
          </li>
          <li><strong>Target (Years):</strong> Enter a goal if you want to repay early. This overrides other inputs.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li><strong>Monthly Payment:</strong> Your monthly cost during the fixed rate period, including any overpayments.</li>
          <li><strong>Secondary Monthly Payment:</strong> Payment after the fixed term ends, if applicable.</li>
          <li><strong>Time to Complete Mortgage:</strong> Total duration required to repay the loan.</li>
          <li><strong>Remaining Balance After Fixed Term:</strong> Balance still owed after the fixed term.</li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is a <strong>forecasting tool</strong> for illustrative purposes only. It is not financial advice.
          Always consult a qualified mortgage advisor before making decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;
