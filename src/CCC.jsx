import React, { useState } from 'react';
import PieChart from './PieChart'; // using your existing pie chart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [aprEstimated, setAprEstimated] = useState(false);
  const [warning, setWarning] = useState('');

  // Estimate APR based on balance and minimum payment using bisection search
  const estimateAPR = (balanceNum, paymentNum) => {
    if (paymentNum <= 0 || balanceNum <= 0) return 0;

    let low = 0;
    let high = 1; // max monthly rate = 100%
    let mid;
    const epsilon = 1e-10;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const interest = balanceNum * mid;

      if (paymentNum > interest) {
        high = mid;
      } else {
        low = mid;
      }

      if (high - low < epsilon) break;
    }

    return mid * 12 * 100; // convert monthly rate to annual APR in %
  };

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
    setAprEstimated(false);
    setWarning('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const balanceNum = parseFloat(balance.replace(/,/g, ''));
    let aprNum = apr.trim() === '' ? null : parseFloat(apr);
    const paymentNum = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!balanceNum || !paymentNum) {
      setWarning('Please enter both Amount Outstanding and Minimum Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    setWarning('');

    // Estimate APR if not provided
    if (!aprNum) {
      const estimatedAPR = estimateAPR(balanceNum, paymentNum);
      if (estimatedAPR <= 0) {
        setWarning('The payment is too low to ever pay off the balance.');
        setAprEstimated(false);
        setResultsVisible(false);
        return;
      }
      aprNum = estimatedAPR;
      setApr(estimatedAPR.toFixed(2));
      setAprEstimated(true);
    } else {
      setAprEstimated(false);
    }

    // For now, just show APR result (no months/interest yet)
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
              aria-autocomplete="none"
              aria-haspopup="false"
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
              name="apr"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
            />
            {aprEstimated && (
              <small style={{ color: '#888', fontStyle: 'italic', marginTop: '0.25rem' }}>
                * APR estimated from minimum payment
              </small>
            )}
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
              aria-autocomplete="none"
              aria-haspopup="false"
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

        {warning && (
          <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
            {warning}
          </p>
        )}

        {resultsVisible && !warning && (
          <div className="results-box">
            <p>
              <strong>Estimated APR (%):</strong> {apr}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
