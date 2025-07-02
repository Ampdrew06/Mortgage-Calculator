import React, { useState } from 'react';
import PieChart from './PieChart'; // assuming you use the same PieChart component as MC
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
  };

  // Helper: Estimate APR from balance & min payment using formula:
  // APR = 12 * (Monthly Rate) = 12 * (payment / principal - 1)
  // We do a binary search to find monthly rate r where payment ≈ principal * r / (1 - (1+r)^-maxMonths)
  // For simplicity here, we estimate monthly rate as payment / principal if payment > interest only
  const estimateAPR = (principal, payment) => {
    if (principal <= 0 || payment <= 0) return 0;

    let low = 0;
    let high = 1; // 100% monthly rate is max
    let mid;
    let estimatedPayment;

    const maxMonths = 360; // 30 years max to pay off

    const calcPayment = (r) => {
      if (r === 0) return principal / maxMonths;
      return principal * r / (1 - Math.pow(1 + r, -maxMonths));
    };

    // Binary search for monthly rate
    for (let i = 0; i < 30; i++) {
      mid = (low + high) / 2;
      estimatedPayment = calcPayment(mid);

      if (estimatedPayment > payment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    // Annualize monthly rate to APR in percentage
    const aprEstimated = mid * 12 * 100;
    return aprEstimated;
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

    // Estimate APR if user hasn't entered it or it's invalid
    if (!enteredAPR || isNaN(enteredAPR) || enteredAPR <= 0) {
      enteredAPR = estimateAPR(principal, payment);
      setApr(enteredAPR.toFixed(2));
    }

    // For now, just display estimated APR — further payoff calculations coming later
    setResultData({
      totalInterest: 0,
      totalPaid: 0,
      monthsToPayoff: 0,
    });
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
            <p style={{ fontStyle: 'italic', color: 'red' }}>* APR estimated assuming 30 year payoff</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
