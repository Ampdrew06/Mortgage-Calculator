import React, { useState } from 'react';
import PieChart from './PieChart'; // Use your shared PieChart component
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

  // Simulate payoff with given principal, monthlyRate, payment, max 1000 months
  const simulatePayoff = (principal, monthlyRate, payment) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        // Payment too low to pay off balance
        return null;
      }
      remaining -= principalPaid;
      months++;
    }
    if (remaining > 0) return null; // Didn't pay off within 1000 months
    return { months, totalInterest };
  };

  // Estimate APR given principal & payment using binary search on monthly rate
  const estimateAPR = (principal, payment) => {
    let low = 0;
    let high = 1; // 100% monthly interest max (extreme)
    let mid;
    let result;

    for (let i = 0; i < 50; i++) { // 50 iterations for precision
      mid = (low + high) / 2;
      result = simulatePayoff(principal, mid, payment);
      if (result === null) {
        // Payment too low at this rate, need lower rate
        high = mid;
      } else {
        // Payment sufficient, try higher rate to get closer
        low = mid;
      }
    }

    // After search low is approx max monthlyRate that pays off debt
    const payoff = simulatePayoff(principal, low, payment);
    if (!payoff) {
      return null; // Could not estimate APR, payment too low
    }

    return low * 12 * 100; // convert monthly rate to annual % APR
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = apr ? parseFloat(apr) : null;
    let monthlyRate = annualRate ? annualRate / 100 / 12 : null;
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    if (!principal || !payment) {
      setErrorMessage('Please enter Amount Outstanding and Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    // Estimate APR if missing
    if ((!annualRate || annualRate <= 0) && principal && payment) {
      const estimatedAPR = estimateAPR(principal, payment);
      if (estimatedAPR === null) {
        setErrorMessage('The payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      }
      annualRate = estimatedAPR;
      monthlyRate = annualRate / 100 / 12;
      setApr(annualRate.toFixed(2));
      setAprEstimated(true);
    }

    // If target months specified, calculate required payment for target months
    if (!isNaN(target) && target > 0) {
      // Calculate required payment to pay off principal in target months
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      payment = requiredPayment;
    }

    // Simulate payoff using final monthlyRate and payment
    const payoff = simulatePayoff(principal, monthlyRate, payment);
    if (!payoff) {
      setErrorMessage('The payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    const totalPaid = principal + payoff.totalInterest;

    setResultData({
      monthsToPayoff: payoff.months,
      totalInterest: payoff.totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
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

        {aprEstimated && (
          <p style={{ color: 'red', fontStyle: 'italic', marginTop: '0.5rem', textAlign: 'center' }}>
            *APR estimated from minimum payment
          </p>
        )}

        {errorMessage && (
          <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.5rem', textAlign: 'center' }}>
            {errorMessage}
          </p>
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
