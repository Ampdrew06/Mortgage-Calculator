import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [aprEstimated, setAprEstimated] = useState(false);

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
    setAprEstimated(false);
  };

  // Helper function: simulate payoff to check if payment can pay off principal at given monthly rate
  const canPayOff = (principal, monthlyRate, payment) => {
    let balance = principal;
    let months = 0;
    while (balance > 0 && months < 1000) {
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) return false; // Payment too low
      balance -= principalPaid;
      months++;
    }
    return balance <= 0;
  };

  // Estimate APR by binary search on monthlyRate
  const estimateAPR = (principal, payment) => {
    const maxAPR = 100; // max APR % to try
    let low = 0;
    let high = maxAPR / 100 / 12;
    let mid = 0;
    let tries = 0;
    while (tries < 50) {
      mid = (low + high) / 2;
      if (canPayOff(principal, mid, payment)) {
        high = mid;
      } else {
        low = mid;
      }
      tries++;
      if (Math.abs(high - low) < 1e-8) break;
    }
    return mid * 12 * 100; // APR in %
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    let enteredAPR = parseFloat(apr);
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || !payment) {
      alert('Please enter Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    if (!enteredAPR || enteredAPR <= 0 || isNaN(enteredAPR)) {
      // Estimate APR using binary search simulation
      const estimatedAPR = estimateAPR(principal, payment);
      setApr(estimatedAPR.toFixed(2));
      setAprEstimated(true);
    } else {
      setAprEstimated(false);
    }

    setResultsVisible(true);
  };

  return (
    <>
      <div className="header-box">
        <h2>Credit Card Calculator</h2>
      </div>

      <div className="container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="input-row">
            <label htmlFor="balance-input">Amount Outstanding (£)</label>
            <input
              id="balance-input"
              name="balance"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              name="apr"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="monthly-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="monthly-payment-input"
              name="monthlyPayment"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setMonthlyPayment('')}>
              Clear
            </button>
          </div>

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="submit-btn ccc" type="submit" style={{ flex: 1 }}>
              Calculate
            </button>
            <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box" style={{ marginTop: '1rem' }}>
            <p>
              <strong>Estimated APR (%):</strong> {apr}
            </p>
            {aprEstimated && (
              <p style={{ fontStyle: 'italic', color: 'red' }}>
                * APR estimated from Amount Outstanding & Minimum Payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
