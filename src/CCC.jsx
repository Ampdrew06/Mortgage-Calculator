import React, { useState } from 'react';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [estimatedAPR, setEstimatedAPR] = useState(null);

  const resetAll = () => {
    setBalance('');
    setMinPayment('');
    setEstimatedAPR(null);
  };

  const handleCalculate = (e) => {
    e.preventDefault();

    // Parse numbers safely
    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(minPayment.replace(/,/g, ''));

    if (!principal || !payment || payment <= 0 || principal <= 0) {
      alert('Please enter valid Outstanding Balance and Minimum Payment.');
      setEstimatedAPR(null);
      return;
    }

    // Simple APR approximation formula:
    // APR (%) = (Minimum Monthly Payment / Outstanding Balance) * 12 * 100
    const apr = (payment / principal) * 12 * 100;

    setEstimatedAPR(apr.toFixed(2));
  };

  return (
    <div className="container">
      <h2>Credit Card APR Estimator (Simple)</h2>

      <form autoComplete="off" onSubmit={handleCalculate}>
        <div className="input-row">
          <label htmlFor="balance-input">Amount Outstanding (£)</label>
          <input
            id="balance-input"
            name="balance"
            type="text"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 1419.87"
          />
          <button type="button" className="clear-btn" onClick={() => setBalance('')}>
            Clear
          </button>
        </div>

        <div className="input-row">
          <label htmlFor="minpayment-input">Minimum Monthly Payment (£)</label>
          <input
            id="minpayment-input"
            name="minPayment"
            type="text"
            inputMode="decimal"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value)}
            placeholder="e.g. 58"
          />
          <button type="button" className="clear-btn" onClick={() => setMinPayment('')}>
            Clear
          </button>
        </div>

        <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="submit-btn ccc" type="submit" style={{ flex: 1 }}>
            Calculate APR
          </button>
          <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
            Reset All
          </button>
        </div>
      </form>

      {estimatedAPR !== null && (
        <div className="results-box" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p>
            <strong>Estimated APR (%):</strong> {estimatedAPR}
          </p>
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555' }}>
            * Simple estimate assuming minimum payment roughly equals monthly interest
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditCardCalculator;
