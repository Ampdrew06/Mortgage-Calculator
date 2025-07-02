import React, { useState } from 'react';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setAprEstimated(false);
    setResultsVisible(false);
  };

  // Function to estimate APR from balance and minimum payment
  // Returns APR as a decimal (e.g. 0.243 for 24.3%)
  const estimateAPR = (principal, payment) => {
    // Use binary search to find monthly interest rate
    // Lower bound 0, upper bound 100% monthly rate (1.0)
    let low = 0;
    let high = 1;
    let guess = 0;
    const tolerance = 0.01; // Payment tolerance in currency
    const maxIterations = 100;
    
    // Helper to simulate payment with guessed monthly rate
    const simulatePayment = (monthlyRate) => {
      let remaining = principal;
      let interestAccrued = 0;
      // Only one month needed for estimation, so payment must cover interest + some principal
      // So monthly payment should be >= interest
      return monthlyRate * remaining; // monthly interest amount
    };

    for (let i = 0; i < maxIterations; i++) {
      guess = (low + high) / 2;
      const interestOnly = simulatePayment(guess);
      if (Math.abs(interestOnly - payment) < tolerance) {
        return guess * 12 * 100; // Convert monthly rate to APR % (annual)
      }
      if (interestOnly > payment) {
        // Guess too high (interest alone > payment)
        high = guess;
      } else {
        // Guess too low
        low = guess;
      }
    }
    // If not found, return best guess
    return guess * 12 * 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    let aprValue = apr ? parseFloat(apr) : null;
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || !payment) {
      alert('Please enter Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    if (!aprValue) {
      // Estimate APR
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
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              autoComplete="off"
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              type="text"
              inputMode="decimal"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setAprEstimated(false);
              }}
              autoComplete="off"
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="monthly-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="monthly-payment-input"
              type="text"
              inputMode="decimal"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              autoComplete="off"
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
              <strong>Estimated APR (%): </strong> {apr}
            </p>
            {aprEstimated && (
              <p style={{ color: 'red', fontStyle: 'italic' }}>
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
