import React, { useState } from 'react';
import PieChart from './PieChart'; // Assuming your shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [estimatedApr, setEstimatedApr] = useState(null);
  const [aprEstimatedFlag, setAprEstimatedFlag] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setEstimatedApr(null);
    setAprEstimatedFlag(false);
    setResultsVisible(false);
    setErrorMsg('');
  };

  // Helper: simulate payoff for given balance, monthly payment, monthly rate
  // Returns months to payoff or -1 if payment too low
  const simulatePayoff = (principal, monthlyRate, payment, maxMonths = 1000) => {
    let remaining = principal;
    let months = 0;
    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        // Payment too low to reduce principal => no payoff
        return -1;
      }
      remaining -= principalPaid;
      months++;
    }
    return months >= maxMonths ? -1 : months;
  };

  // Estimate APR via bisection between low and high APR guesses
  const estimateAPR = (principal, payment) => {
    const maxIterations = 50;
    const tolerance = 0.0001;
    let low = 0.0001; // Avoid zero to prevent div by zero
    let high = 1; // 100% APR monthly approx (very high)
    let mid = 0;
    let months = -1;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      months = simulatePayoff(principal, mid / 12, payment);
      if (months === -1) {
        // Payment too low for this APR, increase APR guess
        low = mid;
      } else {
        // We can pay off at this APR, try lower APR
        high = mid;
      }
      if (high - low < tolerance) break;
    }

    // Return APR as annual percentage (mid * 100)
    return mid * 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setAprEstimatedFlag(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = apr ? parseFloat(apr) : null;
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    if (!principal || !payment) {
      setErrorMsg('Please enter Amount Outstanding and Minimum Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    // Estimate APR if missing
    if (!annualRate && payment) {
      const aprEstimate = estimateAPR(principal, payment);
      if (aprEstimate > 1000) {
        // APR estimate too high => payment too low to pay off
        setErrorMsg('The payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      }
      annualRate = aprEstimate;
      setAprEstimatedFlag(true);
      setApr(annualRate.toFixed(2)); // Show estimated APR in input box
    }

    if (!annualRate) {
      setErrorMsg('Please enter APR (%) or leave blank to estimate.');
      setResultsVisible(false);
      return;
    }

    const monthlyRate = annualRate / 100 / 12;

    if (target) {
      // User entered target months: calculate required payment for target
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      let totalInterest = 0;
      let remaining = principal;
      for (let i = 0; i < target; i++) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = requiredPayment - interest;
        remaining -= principalPaid;
      }
      const totalPaid = principal + totalInterest;

      setResultData({
        totalInterest: totalInterest.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        monthsToPayoff: target,
      });
      setResultsVisible(true);
      return;
    }

    // No target: simulate payoff months based on current payment and rate
    const monthsToPayoff = simulatePayoff(principal, monthlyRate, payment);
    if (monthsToPayoff === -1) {
      setErrorMsg('The payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    // Calculate total interest paid over payoff period
    let totalInterest = 0;
    let remaining = principal;
    for (let i = 0; i < monthsToPayoff; i++) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;
      remaining -= principalPaid;
    }
    const totalPaid = principal + totalInterest;

    setResultData({
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      monthsToPayoff,
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
              placeholder="e.g. 1419.87"
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
            {aprEstimatedFlag && (
              <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                *APR estimated from minimum payment
              </p>
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
              placeholder="e.g. 58"
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
              placeholder="Optional"
            />
            <button type="button" className="clear-btn" onClick={() => setTargetMonths('')}>
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
              style={{ flex: 1 }}
              onClick={resetAll}
            >
              Reset All
            </button>
          </div>
        </form>

        {errorMsg && (
          <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
            {errorMsg}
          </p>
        )}

        {resultsVisible && !errorMsg && (
          <div className="results-box">
            <p>
              <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £
              {parseFloat(resultData.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p>
              <strong>Total Paid:</strong> £
              {parseFloat(resultData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
