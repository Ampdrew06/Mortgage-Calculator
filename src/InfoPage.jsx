import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <button className="share-btn" onClick={onBack} title="Back to Calculator">← Back</button>
      </div>

      <div className="info-section">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><strong>Loan Amount (£):</strong> The total mortgage you’re borrowing.</li>
          <li><strong>Loan Term (Years):</strong> Total length of your mortgage.</li>
          <li><strong>Initial Rate (%):</strong> Introductory interest rate.</li>
          <li><strong>Fixed Term (Years):</strong> How long the fixed rate lasts (if any).</li>
          <li><strong>Secondary Rate (%):</strong> What your rate changes to after the fixed period.</li>
          <li><strong>Overpayment (£):</strong> Optional – monthly extra payment.<br />
          • If a fixed term and secondary rate are entered, overpayments only apply during the fixed period.<br />
          • If using just a basic loan setup (e.g. Loan Amount, Term, Interest Rate), overpayments apply throughout.</li>
          <li><strong>Target Years:</strong> Optional – enter a goal if you want to repay early. Overrides other term logic.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li><strong>Monthly Payment:</strong> Your monthly cost during the fixed rate period, including overpayments.</li>
          <li><strong>Secondary Monthly Payment:</strong> What you’ll pay after the fixed term ends (if applicable).</li>
          <li><strong>Time to Complete Mortgage:</strong> Total time to repay the loan with current values.</li>
          <li><strong>Remaining Balance After Fixed Term:</strong> What’s left to repay after the fixed period (if applicable).</li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is a <strong>forecasting tool</strong> for illustration purposes only. It is not financial advice.
          Always consult a qualified mortgage advisor before making financial decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;
