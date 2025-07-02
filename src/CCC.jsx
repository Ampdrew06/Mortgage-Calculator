import React, { useState } from 'react';
import PieChart from './PieChart'; // your shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    estimatedAPR: 0,
    warning: '',
  });

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
    setResultData({
      estimatedAPR: 0,
      warning: '',
    });
  };

  // Estimate APR based on balance and monthly payment
  const estimateAPR = (principal, payment) => {
    // Monthly interest rate guess boundaries (0% to 300% APR)
    let low = 0;
    let high = 3; // 3 = 300% APR / 12 per month
    let mid = 0;
    let epsilon = 0.00001; // accuracy for binary search

    // If payment <= principal * low interest, no payoff possible
    if (payment <= principal * low) return -1;

    while (high - low > epsilon) {
      mid = (low + high) / 2;
      // Interest accrued monthly
      const interest = principal * mid;
      if (payment > interest) {
        // Payment covers interest + some principal, try lower rate
        high = mid;
      } else {
        // Payment too low, increase rate
        low = mid;
      }
    }
    // APR is monthly rate * 12 * 100
    return mid * 12 * 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || !payment) {
      setResultData({ estimatedAPR: 0, warning: 'Please enter valid Balance and Monthly Payment.' });
      setResultsVisible(true);
      return;
    }

    // If APR is given, just display it as is (no calc here)
    if (apr && apr.trim() !== '') {
      setResultData({ estimatedAPR: parseFloat(apr), warning: '' });
      setResultsVisible(true);
      return;
    }

    // Estimate APR from balance and monthly payment
    const estimatedAPR = estimateAPR(principal, payment);

    if (estimatedAPR === -1) {
      setResultData({ estimatedAPR: 0, warning: 'The payment is too low to cover interest.' });
      setResultsVisible(true);
      return;
    }

    setResultData({ estimatedAPR: estimatedAPR.toFixed(2), warning: '* APR estimated from minimum payment' });
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
              value={apr || (resultData.estimatedAPR ? resultData.estimatedAPR : '')}
              onChange={(e) => setApr(e.target.value)}
              placeholder="Leave blank to estimate"
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
          <div className="results-box">
            {resultData.estimatedAPR > 0 && (
              <p>
                <strong>Estimated APR:</strong> {resultData.estimatedAPR}%
              </p>
            )}
            {resultData.warning && <p style={{ color: 'red' }}>{resultData.warning}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
