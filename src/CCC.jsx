import React, { useState } from 'react';
import PieChart from './PieChart'; // using your shared PieChart component
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
  const [paymentTooLow, setPaymentTooLow] = useState(false);

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setPaymentTooLow(false);
  };

  // Simulate payoff returns true if balance is paid off with given monthlyRate and payment
  const simulatePayoff = (principal, monthlyRate, payment) => {
    let balance = principal;
    let months = 0;
    const maxMonths = 1000;

    while (balance > 0 && months < maxMonths) {
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        // Payment too low, balance won't reduce
        return false;
      }
      balance -= principalPaid;
      months++;
    }
    return balance <= 0;
  };

  // Estimate APR based on principal and payment (returns APR as percent, or -1 if impossible)
  const estimateAPR = (principal, payment) => {
    if (payment <= 0) return -1;

    const minMonthlyRate = 0.001; // 0.1% monthly (~1.2% APR)
    const minInterest = principal * minMonthlyRate;

    if (payment <= minInterest) {
      // Payment too low to cover even minimum interest, no payoff possible
      return -1;
    }

    let low = 0;
    let high = 1; // 100% monthly (~1200% APR) upper limit
    let apr = -1;
    let iterations = 0;
    const maxIterations = 30;

    while (iterations < maxIterations) {
      const mid = (low + high) / 2;
      const monthlyRate = mid;
      if (simulatePayoff(principal, monthlyRate, payment)) {
        apr = mid;
        high = mid;
      } else {
        low = mid;
      }
      iterations++;
    }

    return apr === -1 ? -1 : apr * 12 * 100; // convert monthly rate to APR percent
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = apr ? parseFloat(apr) / 100 : null;
    const monthlyRate = annualRate !== null ? annualRate / 12 : null;
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      alert('Please enter at least Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    setPaymentTooLow(false);
    setAprEstimated(false);

    // Estimate APR if not provided
    if (!annualRate) {
      const aprEstimate = estimateAPR(principal, payment);
      if (aprEstimate === -1) {
        // Payment too low to pay off
        setPaymentTooLow(true);
        setResultData({ totalInterest: 0, totalPaid: principal.toFixed(2), monthsToPayoff: 0 });
        setApr('');
        setResultsVisible(true);
        return;
      } else {
        annualRate = aprEstimate / 100;
        setApr(aprEstimate.toFixed(2));
        setAprEstimated(true);
      }
    }

    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    if (!isNaN(target)) {
      const requiredPayment = (principal * (annualRate / 12)) / (1 - Math.pow(1 + (annualRate / 12), -target));
      payment = requiredPayment;
      months = target;
      for (let i = 0; i < months; i++) {
        const interest = remaining * (annualRate / 12);
        totalInterest += interest;
        const principalPaid = payment - interest;
        remaining -= principalPaid;
      }
    } else {
      while (remaining > 0 && months < 1000) {
        const interest = remaining * (annualRate / 12);
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) break;
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
            {aprEstimated && <div style={{ color: '#4aa4e3', marginTop: '0.25rem' }}>*APR estimated from minimum payment</div>}
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

        {paymentTooLow && (
          <div style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
            The payment is too low to ever pay off the balance.
          </div>
        )}

        {resultsVisible && !paymentTooLow && (
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
