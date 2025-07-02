import React, { useState } from 'react';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setAprEstimated(false);
    setErrorMessage('');
  };

  // Helper to estimate APR given balance and monthly payment
  const estimateAPR = (principal, payment) => {
    if (payment <= 0 || principal <= 0) return null;

    // Use binary search to estimate monthly rate
    let low = 0;
    let high = 1; // 100% monthly rate max (unrealistic, but safe upper bound)
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      let remaining = principal;
      let totalMonths = 0;

      // Simulate paying down balance with mid monthly interest
      while (remaining > 0 && totalMonths < 1000) {
        const interest = remaining * mid;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) {
          // Payment too low to cover interest
          break;
        }
        remaining -= principalPaid;
        totalMonths++;
      }

      if (remaining <= 0) {
        // Paid off, try higher rate to get closer
        low = mid;
      } else {
        // Didn't pay off, lower rate
        high = mid;
      }

      if (high - low < tolerance) {
        break;
      }
    }

    return low * 12 * 100; // Convert monthly rate to annual percentage rate
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || principal <= 0) {
      setErrorMessage('Please enter a valid Amount Outstanding.');
      return;
    }
    if (!payment || payment <= 0) {
      setErrorMessage('Please enter a valid Minimum Monthly Payment.');
      return;
    }

    // If APR is blank, estimate it
    if (!apr) {
      const estimatedAPR = estimateAPR(principal, payment);
      if (estimatedAPR === null || isNaN(estimatedAPR) || estimatedAPR <= 0) {
        setErrorMessage('Payment too low to ever pay off the balance.');
        return;
      }
      setApr(estimatedAPR.toFixed(2));
      setAprEstimated(true);
    } else {
      // APR entered manually, just clear error and note
      setAprEstimated(false);
    }
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
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>
              Clear
            </button>
          </div>

          <div className="input-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
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
              placeholder="Leave blank to estimate"
              style={{ maxWidth: '200px' }}
            />
            {aprEstimated && (
              <small style={{ color: '#999', fontStyle: 'italic', marginTop: '0.25rem' }}>
                * APR estimated from minimum payment
              </small>
            )}
          </div>

          <div className="input-row">
            <label htmlFor="monthly-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="monthly-payment-input"
              type="text"
              inputMode="decimal"
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
            <button
              type="button"
              className="reset-btn"
              onClick={resetAll}
              style={{ flex: 1 }}
            >
              Reset All
            </button>
          </div>

          {errorMessage && (
            <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </>
  );
};

export default CreditCardCalculator;
