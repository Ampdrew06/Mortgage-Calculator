import React, { useState } from 'react';
import PieChart from './PieChart'; // Your shared PieChart component
import './App.css';

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
  const [aprEstimated, setAprEstimated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setErrorMsg('');
  };

  // Given principal, payment, and n months, returns monthly interest rate that satisfies payment formula
  // Using binary search between 0 and max rate
  const estimateMonthlyInterestRate = (principal, payment, n) => {
    if (payment <= principal / n) return null; // Payment too low even at 0% interest

    let low = 0;
    let high = 1; // 100% monthly interest max (absurdly high)
    const maxIter = 100;
    const tol = 1e-10;
    let mid;

    for (let i = 0; i < maxIter; i++) {
      mid = (low + high) / 2;
      // Calculate payment for mid interest rate
      const calcPayment = (principal * mid) / (1 - Math.pow(1 + mid, -n));

      if (Math.abs(calcPayment - payment) < tol) {
        return mid;
      }
      if (calcPayment > payment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return mid;
  };

  // Simulate payoff with monthly interest rate and payment, returns months & totalInterest or null if never pays off
  const simulatePayoff = (principal, monthlyRate, payment, maxMonths = 1000) => {
    let remaining = principal;
    let totalInterest = 0;
    let months = 0;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        return null; // Payment too low to reduce principal
      }
      remaining -= principalPaid;
      months++;
    }

    return { months, totalInterest };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrorMsg('');
    setResultsVisible(false);
    setAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = parseFloat(apr);
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      setErrorMsg('Please enter valid Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    if (isNaN(annualRate) || annualRate <= 0) {
      if (isNaN(target)) {
        // If no target months provided, estimate APR from payment and assume 60 months (5 years) payoff period
        const assumedMonths = 60;

        const monthlyRateEstimate = estimateMonthlyInterestRate(principal, payment, assumedMonths);
        if (monthlyRateEstimate === null) {
          setErrorMsg('The payment is too low to ever pay off the balance.');
          return;
        }
        annualRate = monthlyRateEstimate * 12 * 100; // Convert to APR %
        setApr(annualRate.toFixed(2));
        setAprEstimated(true);
      } else {
        // If target months is provided, no APR estimate needed — APR must be input or 0
        setErrorMsg('Please enter APR or leave Target months blank to estimate APR.');
        return;
      }
    }

    const monthlyRate = annualRate / 100 / 12;
    let months = 0;
    let totalInterest = 0;

    if (!isNaN(target)) {
      // Calculate payment needed for target months
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      payment = requiredPayment;
      months = target;

      let remainingBalance = principal;
      for (let i = 0; i < months; i++) {
        const interest = remainingBalance * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        remainingBalance -= principalPaid;
      }
    } else {
      const payoff = simulatePayoff(principal, monthlyRate, payment);
      if (!payoff) {
        setErrorMsg('The payment is too low to ever pay off the balance.');
        return;
      }
      months = payoff.months;
      totalInterest = payoff.totalInterest;
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
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
              Clear
            </button>
            {aprEstimated && <p style={{ color: 'red', fontWeight: 'bold' }}>* APR estimated assuming 5-year payoff period</p>}
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

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £{parseFloat(resultData.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p>
              <strong>Total Paid:</strong> £{parseFloat(resultData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

        {errorMsg && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>{errorMsg}</p>}
      </div>
    </>
  );
};

export default CreditCardCalculator;
