import React, { useState } from 'react';
import PieChart from './PieChart'; // Your shared PieChart component
import './App.css';

function estimateAPR(principal, payment) {
  if (payment <= principal / 12) {
    // Payment too low to ever pay off balance
    return -1;
  }

  let low = 0;
  let high = 1; // 100% monthly interest max (very high to start)
  let mid;
  const maxIterations = 50;
  const tolerance = 0.0001;

  function canPayOff(monthlyRate) {
    let balance = principal;
    let months = 0;
    while (balance > 0 && months < 1000) {
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) return false;
      balance -= principalPaid;
      months++;
    }
    return months < 1000;
  }

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    if (canPayOff(mid)) {
      high = mid;
    } else {
      low = mid;
    }
    if (high - low < tolerance) break;
  }

  return mid * 12 * 100; // convert monthly rate to annual percentage rate (APR)
}

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    let aprValue = parseFloat(apr);
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      setErrorMessage('Please enter at least Amount Outstanding and Minimum Payment.');
      setResultsVisible(false);
      return;
    }

    if (isNaN(aprValue) || aprValue <= 0) {
      // Estimate APR if blank or invalid
      const estimatedAPR = estimateAPR(principal, payment);
      if (estimatedAPR === -1) {
        setErrorMessage('The payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      }
      aprValue = estimatedAPR;
      setApr(estimatedAPR.toFixed(2));
      setInfoMessage('* APR estimated from Amount Outstanding & Minimum Payment');
      setErrorMessage('');
    } else {
      setErrorMessage('');
      setInfoMessage('');
    }

    // For now, just show estimated APR and basic results placeholders
    setResultData({
      totalInterest: 0,
      totalPaid: principal.toFixed(2),
      monthsToPayoff: target || 0,
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
            {infoMessage && (
              <small style={{ color: 'blue', marginTop: '4px' }}>{infoMessage}</small>
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

          <div className="input-row">
            <label htmlFor="target-months-input">Target (Months)</label>
            <input
              id="target-months-input"
              name="targetMonths"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setTargetMonths('')}>
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

        {errorMessage && (
          <p style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>{errorMessage}</p>
        )}

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Estimated APR (%):</strong> {parseFloat(apr).toFixed(2)}
            </p>
            <p>
              <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff || 'N/A'}
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £{parseFloat(resultData.totalInterest).toFixed(2)}
            </p>
            <p>
              <strong>Total Paid:</strong> £{parseFloat(resultData.totalPaid).toFixed(2)}
            </p>

            <PieChart
              interest={parseFloat(resultData.totalInterest)}
              principal={parseFloat(balance.replace(/,/g, ''))}
            />

            <p
              className="chart-labels"
              style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}
            >
              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Interest Paid</span>
              <span style={{ color: '#4aa4e3', fontWeight: 'bold' }}>Principal Paid</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
