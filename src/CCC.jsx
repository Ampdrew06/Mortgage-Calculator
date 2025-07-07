import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [apr, setApr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    firstMinPayment: 0,
  });

  // Constants for min payment calculation
  const MIN_PAYMENT_FLOOR = 25;    // £25 floor
  const MIN_PAYMENT_PERCENT = 0.015; // 1.5% of remaining balance

  // Parse input to float safely
  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate payoff month-by-month for given APR,
  // calculating min payment each month as max(floor, percent * balance)
  // initialMinPayment is user-given min payment (used in first month)
  const simulatePayoff = (principal, annualRate, initialMinPayment, maxMonths = 600) => {
    const monthlyRate = annualRate / 12 / 100;
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstMinPayment = initialMinPayment;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      // Calculate min payment for this month
      const percentPayment = remaining * MIN_PAYMENT_PERCENT;
      let payment = Math.max(MIN_PAYMENT_FLOOR, percentPayment);

      // On first month use user’s initial min payment if it is higher
      if (months === 0 && initialMinPayment && initialMinPayment > payment) {
        payment = initialMinPayment;
        firstMinPayment = initialMinPayment;
      }

      // If payment doesn’t even cover interest, can’t pay off loan
      if (payment < interest) {
        return { canPayOff: false };
      }

      const principalPaid = payment - interest;
      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: remaining <= 0,
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstMinPayment,
    };
  };

  // Binary search to find APR that produces user-given min payment as initial payment
  const estimateAPR = (principal, initialMinPayment, targetMonths = 360) => {
    let low = 0;
    let high = 200; // max 200% APR
    const maxIterations = 60;
    const tolerance = 0.5; // £0.50 tolerance on initial min payment

    for (let i = 0; i < maxIterations; i++) {
      const midAPR = (low + high) / 2;
      const sim = simulatePayoff(principal, midAPR, initialMinPayment, targetMonths);

      if (!sim.canPayOff) {
        // payment too low, APR guess too low
        low = midAPR;
      } else {
        // check difference between simulated first payment and target payment
        const diff = sim.firstMinPayment - initialMinPayment;

        if (Math.abs(diff) <= tolerance) {
          return midAPR; // close enough APR found
        }

        if (diff > 0) {
          // simulated payment too high, APR guess too high
          high = midAPR;
        } else {
          // simulated payment too low, APR guess too low
          low = midAPR;
        }
      }
    }

    return -1; // failed to find APR
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const m = parseNumber(minPayment);
    return p > 0 && m > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);
    setApr('');

    const principal = parseNumber(balance);
    const inputMinPayment = parseNumber(minPayment);
    const target = parseNumber(targetYears);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }
    if (!inputMinPayment || inputMinPayment <= 0) {
      setErrorMsg('Please enter a valid Minimum Monthly Payment.');
      return;
    }

    const targetMonths = target && target > 0 ? Math.round(target * 12) : 360; // default 30 years

    // Estimate APR that corresponds to given min payment
    const estimatedAPR = estimateAPR(principal, inputMinPayment, targetMonths);

    if (estimatedAPR <= 0) {
      setErrorMsg('Unable to estimate APR with given inputs.');
      return;
    }

    // Run simulation with estimated APR and user min payment
    const sim = simulatePayoff(principal, estimatedAPR, inputMinPayment, targetMonths);

    if (!sim.canPayOff) {
      setErrorMsg('Minimum payment too low to ever pay off the balance.');
      return;
    }

    setResultData({
      payoffMonths: sim.months,
      totalInterest: sim.totalInterest.toFixed(2),
      totalPaid: sim.totalPaid.toFixed(2),
      firstMinPayment: inputMinPayment.toFixed(2),
    });
    setApr(estimatedAPR.toFixed(2));
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance('');
    setMinPayment('');
    setTargetYears('');
    setApr('');
    setResultsVisible(false);
    setErrorMsg('');
    setResultData({
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      firstMinPayment: 0,
    });
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
              value={balance}
              onChange={(e) => {
                setBalance(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
                setApr('');
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="min-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="min-payment-input"
              name="minPayment"
              type="text"
              inputMode="decimal"
              value={minPayment}
              onChange={(e) => {
                setMinPayment(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
                setApr('');
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setMinPayment('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="target-years-input">Target Payoff Time (Years, optional)</label>
            <input
              id="target-years-input"
              name="targetYears"
              type="text"
              inputMode="decimal"
              placeholder="Leave blank if no target"
              value={targetYears}
              onChange={(e) => {
                setTargetYears(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
                setApr('');
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setTargetYears('')}>
              Clear
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.5rem' }}>{errorMsg}</p>
          )}

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="submit-btn ccc"
              type="submit"
              style={{ flex: 1 }}
              disabled={!canSubmit()}
              title={!canSubmit() ? 'Enter Amount Outstanding and Minimum Monthly Payment' : 'Submit'}
            >
              Submit
            </button>
            <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Estimated APR:</strong> {apr}%
            </p>
            <p>
              <strong>Estimated Payoff Time:</strong> {(resultData.payoffMonths / 12).toFixed(1)} years
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
              colors={['#ff4d4f', '#4aa4e3']}
            />

            <p
              className="chart-labels"
              style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}
            >
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Interest Paid</span>
              <span style={{ color: '#4aa4e3', fontWeight: 'bold' }}>Principal Paid</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
