import React, { useState } from 'react';
import PieChart from './PieChart'; // Using the shared PieChart component
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
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setErrorMessage('');
  };

  // Calculate payoff months & total interest for given monthlyRate & payment
  const calculatePayoff = (balance, monthlyRate, monthlyPayment) => {
    let remaining = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 1000;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPayment = monthlyPayment - interest;

      if (principalPayment <= 0) {
        return null; // Can't pay off with this payment
      }

      remaining -= principalPayment;
      months++;
    }

    if (months === maxMonths) return null;

    return { months, totalInterest };
  };

  // Estimate APR from balance and min payment by binary search
  const estimateAPR = (balance, minPayment) => {
    if (minPayment <= 0 || balance <= 0) return null;

    let low = 0.0001;   // small positive number to avoid divide by zero
    let high = 0.1;     // max monthly interest rate (10% = 120% APR)
    let mid = 0;

    for (let i = 0; i < 30; i++) {
      mid = (low + high) / 2;
      const result = calculatePayoff(balance, mid, minPayment);

      if (!result) {
        low = mid;
        continue;
      }

      if (result.months > 240) {
        low = mid;
      } else {
        high = mid;
      }

      if (high - low < 0.00001) break;
    }

    return mid * 12 * 100; // convert monthly rate to annual percentage
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = parseFloat(apr);
    const monthlyRate = annualRate ? annualRate / 100 / 12 : 0;
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    if (!principal) {
      setErrorMessage('Please enter the Amount Outstanding.');
      setResultsVisible(false);
      return;
    }
    if (!payment) {
      setErrorMessage('Please enter the Minimum Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    // If APR is missing, estimate it
    if (!annualRate) {
      const estAPR = estimateAPR(principal, payment);
      if (estAPR === null) {
        setErrorMessage('The Payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      } else {
        annualRate = estAPR;
        setApr(annualRate.toFixed(2));
        setAprEstimated(true);
      }
    }

    const calcMonthlyRate = annualRate / 100 / 12;

    if (!isNaN(target)) {
      const requiredPayment = (principal * calcMonthlyRate) / (1 - Math.pow(1 + calcMonthlyRate, -target));
      payment = requiredPayment;
      months = target;
      for (let i = 0; i < months; i++) {
        const interest = remaining * calcMonthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        remaining -= principalPaid;
      }
    } else {
      while (remaining > 0 && months < 1000) {
        const interest = remaining * calcMonthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) {
          setErrorMessage('The Payment is too low to ever pay off the balance.');
          setResultsVisible(false);
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
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
              Clear
            </button>
          </div>

          {aprEstimated && (
            <div style={{ color: 'red', fontStyle: 'italic', marginBottom: '1rem' }}>
              *APR estimated from minimum payment
            </div>
          )}

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

        {errorMessage && (
          <div style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
