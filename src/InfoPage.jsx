import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container info-page">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <div className="header-buttons">
          <button className="share-btn blue-btn">Share</button>
          <button className="share-btn back-btn" onClick={onBack} title="Back to Calculator">← Back</button>
        </div>
      </div>

      <div>
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Loan Amount (£):</strong></span> The total mortgage you’re borrowing.</li>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Loan Term (Years):</strong></span> Total length of your mortgage.</li>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Initial Rate (%):</strong></span> Introductory interest rate.</li>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Fixed Term (Years):</strong></span> Time the fixed rate lasts (if any).</li>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Secondary Rate (%):</strong></span> The rate after the fixed term ends.</li>
          <li>
            <span style={{ whiteSpace: 'nowrap' }}><strong>Overpayment (£):</strong></span> Optional monthly extra payment.
            <ul className="sub-points">
              <li>With fixed term & secondary rate: applies only during fixed period.</li>
              <li>Basic setup: applies throughout the term.</li>
            </ul>
          </li>
          <li><span style={{ whiteSpace: 'nowrap' }}><strong>Target (Years):</strong></span> Enter a goal if you want to repay early.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li>
            <strong>Monthly Payment:</strong><br />
            Your monthly cost during the fixed term, including overpayments.
          </li>
          <li>
            <strong>Secondary Monthly Payment:</strong><br />
            What you’ll pay after the fixed term ends, if applicable.
          </li>
          <li>
            <strong>Time to Complete Mortgage:</strong><br />
            Total duration required to repay the loan.
          </li>
          <li>
            <strong>Remaining Balance After Fixed Term:</strong><br />
            Balance still owed after the fixed term.
          </li>
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
