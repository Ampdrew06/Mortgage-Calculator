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

  // Simulate loan payoff with given monthlyRate and payment
  // Returns true if loan is paid off within maxMonths, false otherwise
  const canPayOff = (principal, monthlyRate, payment, maxMonths = 600) => {
    let remaining = principal;
    for (let month = 0; month < maxMonths; month++) {
      const interest = remaining * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        // Payment too low to reduce principal
        return false;
      }
      remaining -= principalPaid;
      if (remaining <= 0) {
        return true;
      }
    }
    return false;
  };

  // Estimate APR (%) from principal and payment using binary search on monthlyRate
  const estimateAPR = (principal, payment) => {
    let low = 0;
    let high = 1; // 100% monthly rate upper bound (very high, will be adjusted)
    const tolerance = 0.01;
    let bestAPR = -1;

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const paidOff = canPayOff(principal, mid, payment);

      if (paidOff) {
        bestAPR = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    if (bestAPR === -1) {
      // Payment too low to pay off any reasonable APR
      return null;
    }

    // Convert monthly rate to annual APR in percentage
    return bestAPR * 12 * 100;
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
      if (estimatedAPR === null) {
        alert('The payment is too low to ever pay off the balance.');
        setApr('');
        setAprEstimated(false);
        setResultsVisible(false);
        return;
      }
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
