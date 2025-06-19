import React from 'react';
import './App.css';

function InfoPage({ onBack }) {
  return (
    <div className="container">
      <div className="header">
        <h1>Info & Disclaimer</h1>
        <div className="header-buttons">
          <button className="share-btn" onClick={onBack} title="Back to Calculator">← Back</button>
          <button className="share-btn" onClick={() => navigator.share?.({
            title: 'Mortgage Calculator',
            text: 'Check out this free mortgage calculator!',
            url: window.location.href,
          })}>⤴</button>
        </div>
      </div>

      <div className="info-page">
        <h2>How to Use This Calculator</h2>
        <ul>
          <li><strong>Loan Amount (£):</strong> The total mortgage you’re borrowing.</li>
          <li><strong>Loan Term (Years):</strong> The overall duration of the mortgage.</li>
          <li><strong>Initial Rate (%):</strong> Your introductory interest rate.</li>
          <li><strong>Fixed Term (Years):</strong> (Optional) Duration of the initial fixed rate period.</li>
          <li><strong>Secondary Rate (%):</strong> (Optional) Your new rate after the fixed period ends.</li>
          <li><strong>Overpayment (£):</strong> (Optional) A monthly extra amount you'd like to pay.<br />
            • In full mortgage mode (fixed + secondary rate), overpayments apply during the fixed term only.<br />
            • In simple mode (Loan + Term + Rate), overpayments apply for the entire loan duration.
          </li>
          <li><strong>Target Years:</strong> (Optional) Overrides the above. Enter a goal if you want to repay faster. The calculator will increase your monthly payments to meet your goal.</li>
        </ul>

        <h2>Results Explained</h2>
        <ul>
          <li><strong>Monthly Payment:</strong> What you'll pay during the fixed term (or overall if no fixed term).</li>
          <li><strong>Secondary Monthly Payment:</strong> If a fixed term is used, this is the new payment afterward.</li>
          <li><strong>Time to Complete Mortgage:</strong> The total time to repay your mortgage based on the current inputs.</li>
          <li><strong>Remaining Balance After Fixed Term:</strong> If a fixed term is used, this shows the balance left to repay at that point.</li>
        </ul>

        <h2>Disclaimer</h2>
        <p>
          This calculator is for <strong>illustration purposes only</strong>. It does not offer financial advice.
          Always consult a qualified advisor before making mortgage decisions.
        </p>
      </div>
    </div>
  );
}

export default InfoPage;

