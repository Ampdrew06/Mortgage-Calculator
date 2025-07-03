import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('60'); // default target 60 months
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    estimatedAPR: 0,
    monthsToPayoff: 0,
    totalInterest: 0,
    totalPaid: 0,
  });
  const [message, setMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('60');
    setResultsVisible(false);
    setMessage('');
  };

  // Simulate paying off the balance with given monthly interest rate and fixed payment.
  const simulatePayoff = (principal, monthlyRate, payment, maxMonths = 1000) => {
    let remaining = principal;
    for (let month = 0; month < maxMonths; month++) {
      let interest = remaining * monthlyRate;
      let principalPaid = payment - interest;
      if (principalPaid <= 0) return -1; // Payment too low, balance won't be paid off
      remaining -= principalPaid;
      if (remaining <= 0) return month + 1;
    }
    return -1; // Didn't pay off in maxMonths
  };

  // Estimate APR using binary search to get payoff near target months
  const estimateAPR = (principal, payment, target) => {
    let low = 0.0001; // Avoid 0 exactly
    let high = 0.1; // Start with 10% monthly (~120% APR), adjust if needed
    let mid;
    let monthsToPayoff = -1;

    // Expand high if needed (in case payment is too low even for 10%)
    while (simulatePayoff(principal, high, payment) === -1 && high < 1) {
      high *= 2;
    }

    for (let i = 0; i < 100; i++) {
      mid = (low + high) / 2;
      monthsToPayoff = simulatePayoff(principal, mid, payment);
      if (monthsToPayoff === -1 || monthsToPayoff > target) {
        high = mid;
      } else {
        low = mid;
      }
      if (high - low < 1e-7) break;
    }

    if (monthsToPayoff === -1) return { apr: 0, months: -1 };

    return { apr: mid * 12 * 100, months: monthsToPayoff };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    const principal = parseFloat(balance.replace(/,/g, ''));
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseInt(targetMonths) || 60;

    if (!principal || !payment || payment <= 0) {
      setMessage('Please enter valid Amount Outstanding and Minimum Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    if (apr && apr.trim() !== '') {
      // If APR given, calculate months and interest
      const monthlyRate = parseFloat(apr) / 100 / 12;
      const months = simulatePayoff(principal, monthlyRate, payment);
      if (months === -1) {
        setMessage('The payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      }
      let totalInterest = 0;
      let remaining = principal;
      for (let i = 0; i < months; i++) {
        let interest = remaining * monthlyRate;
        let principalPaid = payment - interest;
        remaining -= principalPaid;
        totalInterest += interest;
      }
      setResultData({
        estimatedAPR: parseFloat(apr),
        monthsToPayoff: months,
        totalInterest,
        totalPaid: principal + totalInterest,
      });
      setResultsVisible(true);
      return;
    }

    // Estimate APR based on inputs and target months
    const { apr: estimatedAPR, months } = estimateAPR(principal, payment, target);

    if (months === -1 || estimatedAPR === 0) {
      setMessage('The payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    const monthlyRate = estimatedAPR / 100 / 12;
    let totalInterest = 0;
    let remaining = principal;
    for (let i = 0; i < months; i++) {
      let interest = remaining * monthlyRate;
      let principalPaid = payment - interest;
      remaining -= principalPaid;
      totalInterest += interest;
    }

    setResultData({
      estimatedAPR: estimatedAPR.toFixed(2),
      monthsToPayoff: months,
      totalInterest,
      totalPaid: principal + totalInterest,
    });
    setApr(estimatedAPR.toFixed(2));
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
              value={apr}
              onChange={(e) => setApr(e.target.value)}
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

          <div className="input-row">
            <label htmlFor="target-months-input">Target Payoff Period (Months)</label>
            <input
              id="target-months-input"
              name="targetMonths"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setTargetMonths('')}>
              Clear
            </button>
          </div>

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="submit-btn ccc" type="submit" style={{ flex: 1 }}>
              Calculate APR
            </button>
            <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {message && <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>}

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Estimated APR (%):</strong> {resultData.estimatedAPR}
            </p>
            <p>
              <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £{resultData.totalInterest.toFixed(2)}
            </p>
            <p>
              <strong>Total Paid:</strong> £{resultData.totalPaid.toFixed(2)}
            </p>

            <PieChart interest={resultData.totalInterest} principal={parseFloat(balance.replace(/,/g, ''))} />
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
