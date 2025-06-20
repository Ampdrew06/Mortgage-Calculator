import React from 'react';
import { useNavigate } from 'react-router-dom';

const CCInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <div className="header-box blue-theme">
        <h2>Credit Card Calculator Info</h2>
      </div>

      <div className="info-section">
        <h3>Input Fields</h3>
        <ul>
          <li><strong>Balance (£):</strong> The total current balance you owe on the credit card.</li>
          <li><strong>APR (%):</strong> The Annual Percentage Rate — typically shown on your credit card statement.</li>
          <li><strong>Monthly Payment (£):</strong> The fixed amount you plan to pay each month.</li>
          <li><strong>Target (Months):</strong> Optional. Enter a desired number of months to repay — the calculator will show how much you'd need to pay monthly to meet that goal.</li>
        </ul>
      </div>

      <div className="info-section">
        <h3>Results Explained</h3>
        <ul>
          <li><strong>Months to Pay Off:</strong> How long it will take to fully clear the balance with your chosen payment.</li>
          <li><strong>Total Interest Paid:</strong> The full amount of interest you'll pay across the repayment period.</li>
          <li><strong>Total Paid:</strong> The total of balance + interest — your final cost.</li>
          <li><strong>Pie Chart:</strong> A simple visual showing how much goes toward interest vs. actual debt.</li>
        </ul>
      </div>

      <div className="info-section">
        <h3>Disclaimer</h3>
        <p>This calculator is for illustration purposes only. It does not constitute financial advice. Always check with your lender before making financial decisions.</p>
      </div>

      <div className="button-row">
        <button className="submit-btn" onClick={() => navigate('/ccc')}>Back to Calculator</button>
      </div>
    </div>
  );
};

export default CCInfoPage;
