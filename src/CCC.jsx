import React, { useState } from 'react';
import PieChart from './PieChart'; // your shared PieChart component
import './App.css';

const MAX_ANNUAL_APR = 50; // maximum APR in percent for search (50%)
const MAX_MONTHLY_RATE = MAX_ANNUAL_APR / 100 / 12;

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [aprEstimated, setAprEstimated] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setResultData({
      totalInterest: 0,
      totalPaid: 0,
      monthsToPayoff: 0,
    });
    setErrorMessage('');
  };

  const simulatePayoff = (principal, monthlyRate, payment) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;

      if (principalPaid <= 0) {
        // Payment too low to ever pay off
        return null;
      }
      remaining -= principalPaid;
      months++;
    }

    if (remaining > 0) {
      return null;
    }
    return { months, totalInterest };
  };

  const estimateAPR = (principal, payment) => {
    let low = 0;
    let high = MAX_MONTHLY_RATE;
    let mid;
    let result;

    for (let i = 0; i < 50; i++) {
      mid = (low + high) / 2;
      result = simulatePayoff(principal, mid, payment);

      if (result === null) {
        // Payment too low at this interest rate - try lower
        high = mid;
      } else {
        // Payment covers payoff - try higher rate
        low = mid;
      }
    }

    const payoff = simulatePayoff(principal, low, payment);
    if (!payoff) {
      return null;
    }
    return low * 12 * 100; // annual APR in percent
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResultsVisible(false);
    setAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = apr ? parseFloat(apr) / 100 : null;
    const monthlyRate = annualRate ? annualRate / 12 : null;
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      setErrorMessage('Please enter Balance (Amount Outstanding) and Monthly Payment.');
      return;
    }

    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    // Estimate APR if not provided
    if (!annualRate) {
      const estimatedAPR = estimateAPR(principal, payment);
      if (estimatedAPR === null) {
        setErrorMessage('The payment is too low to ever pay off the balance.');
        return;
      } else {
        annualRate = estimatedAPR / 100;
        setApr(estimatedAPR.toFixed(2));
        setAprEstimated(true);
      }
    }

    const monthlyRateFinal = annualRate / 12;

    // If target months is given, calculate interest and payoff accordingly
    if (!isNaN(target)) {
      const requiredPayment = (principal * monthlyRateFinal) / (1 - Math.pow(1 + monthlyRateFinal, -target));
      months = target;
      let tempRemaining = principal;
      totalInterest = 0;
      for (let i = 0; i < months; i++) {
        const interest = tempRemaining * monthlyRateFinal;
        totalInterest += interest;
        const principalPaid = requiredPayment - interest;
        tempRemaining -= principalPaid;
      }
      remaining = tempRemaining;
    } else {
      // Calculate payoff time with given payment
      months = 0;
      while (remaining > 0 && months < 1000) {
        const interest = remaining * monthlyRateFinal;
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) {
          setErrorMessage('The payment is too low to ever pay off the balance.');
          return;
        }
        remaining -= principalPaid;
        months++;
      }
    }

    const totalPaid = principal + totalInterest;

    setResultData({
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      monthsToPayoff: months,
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
            {aprEstimated && (
              <p style={{ color: 'red', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                * APR estimated from minimum payment
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
          <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem' }}>{errorMessage}</p>
        )}

        {resultsVisible && (
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
