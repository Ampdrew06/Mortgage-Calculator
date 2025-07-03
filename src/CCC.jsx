import React, { useState } from 'react';
import PieChart from './PieChart'; // use your shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [estimatedAprNote, setEstimatedAprNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
    setEstimatedAprNote('');
    setErrorMessage('');
  };

  // Simulate payoff with given monthly rate; returns true if payment pays off principal eventually
  const canPayOff = (principal, monthlyRate, payment) => {
    let balance = principal;
    for (let month = 0; month < 600; month++) { // 50 years max
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) return false; // payment too low to reduce balance
      balance -= principalPaid;
      if (balance <= 0) return true;
    }
    return false;
  };

  // Binary search to estimate monthlyRate that can pay off balance with given payment
  const estimateMonthlyRate = (principal, payment) => {
    let low = 0;
    let high = 1; // 100% monthly is absurdly high but safe upper bound
    let mid = 0;
    let iterations = 0;
    while (high - low > 0.0000001 && iterations < 100) {
      mid = (low + high) / 2;
      if (canPayOff(principal, mid, payment)) {
        low = mid;
      } else {
        high = mid;
      }
      iterations++;
    }
    return mid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEstimatedAprNote('');
    setErrorMessage('');
    setResultsVisible(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || !payment) {
      setErrorMessage('Please enter Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    // If APR provided, just show results (for now no calculation)
    if (apr && !isNaN(parseFloat(apr))) {
      setErrorMessage('APR input currently ignored. Enter blank APR to estimate.');
      return;
    }

    // Check if payment is enough to cover minimum interest assuming some very low APR (e.g. 0.1% monthly)
    const minMonthlyInterest = principal * 0.001;
    if (payment <= minMonthlyInterest) {
      setErrorMessage('The payment is too low to ever pay off the balance.');
      return;
    }

    // Estimate monthly rate by binary search
    const monthlyRate = estimateMonthlyRate(principal, payment);
    const estimatedAPR = monthlyRate * 12 * 100;

    if (estimatedAPR > 1000) {
      setErrorMessage('APR estimation failed — payment too low or data invalid.');
      return;
    }

    setApr(estimatedAPR.toFixed(2));
    setEstimatedAprNote('* APR estimated from Amount Outstanding & Minimum Payment');
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
              aria-autocomplete="none"
              aria-haspopup="false"
              value={apr}
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

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Estimated APR (%):</strong> {apr}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '-0.75rem' }}>{estimatedAprNote}</p>
          </div>
        )}

        {errorMessage && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>}
      </div>
    </>
  );
};

export default CreditCardCalculator;
