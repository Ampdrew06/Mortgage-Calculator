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

  // Estimate APR from balance and monthly payment using algebraic rearrangement of annuity formula
  // Returns APR as a decimal (e.g. 0.24 for 24%), or null if invalid
  const estimateAPR = (principal, payment) => {
    if (payment <= 0 || principal <= 0) return null;

    // Minimum monthly interest rate is > 0 and < ~1 (100%)
    // Use binary search between 0.00001 and 1 monthly interest rate to find APR matching payment
    let low = 0.000001;
    let high = 1;
    let mid = 0;
    const tolerance = 0.0000001;
    const maxIter = 100;
    let iter = 0;

    while (iter < maxIter) {
      mid = (low + high) / 2;
      // Calculate payment for given mid interest rate
      // Using formula: payment = principal * r / (1 - (1+r)^-n)
      // Here n is unknown, but since we want minimum payment to cover interest, check if payment >= principal * mid
      // So approximate number of months by formula rearranged:
      // We can't solve n here directly, so instead check monthly payment for large n:
      // For minimum payment, payment must > principal * mid
      if (payment > principal * mid) {
        high = mid;
      } else {
        low = mid;
      }
      if (high - low < tolerance) break;
      iter++;
    }
    return mid * 12; // return annual rate decimal
  };

  // Simulate payoff over time given principal, monthly interest rate, payment
  // Returns {months, totalInterest} or null if payment too low
  const simulatePayoff = (principal, monthlyRate, payment, maxMonths = 1000) => {
    let remaining = principal;
    let totalInterest = 0;
    let months = 0;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        return null; // payment too low to reduce balance
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
      setErrorMsg('Please enter valid Balance and Monthly Payment.');
      return;
    }

    // If APR not entered, estimate it
    if (isNaN(annualRate) || annualRate <= 0) {
      const aprEstimateDecimal = estimateAPR(principal, payment);
      if (aprEstimateDecimal === null) {
        setErrorMsg('Payment too low to ever pay off the balance.');
        return;
      }
      annualRate = aprEstimateDecimal * 100; // convert to percentage
      setApr(annualRate.toFixed(2));
      setAprEstimated(true);
    }

    const monthlyRate = annualRate / 100 / 12;

    let months = 0;
    let totalInterest = 0;

    if (!isNaN(target)) {
      // If target months given, compute required payment, simulate payoff
      let requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
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
      // Simulate payoff based on given payment
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
            {aprEstimated && <p style={{ color: 'red', fontWeight: 'bold' }}>* APR estimated from minimum payment</p>}
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
