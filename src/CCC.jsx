import React, { useState } from 'react';
import PieChart from './PieChart'; // Assuming this is your shared PieChart component
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
  };

  // Simulate payoff to get months needed for a given monthly payment & monthly interest rate
  const simulatePayoff = (principal, monthlyRate, payment) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    const minPrincipalPayment = principal * 0.01; // Enforce minimum 1% principal paid per month

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      // Enforce minimum principal payment floor
      const principalPaid = Math.max(payment - interest, minPrincipalPayment);

      if (principalPaid <= 0) {
        // Payment too low to pay off
        return { canPayOff: false };
      }

      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: true,
      months,
      totalInterest,
      remaining,
    };
  };

  // Fixed binary search to estimate monthly APR that matches the minimum payment
  const estimateAPR = (principal, payment) => {
    let low = 0;
    let high = 2; // 200% monthly rate max (~2400% APR)
    let mid = 0;
    const maxIterations = 50;
    const tolerance = 0.01;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const simulation = simulatePayoff(principal, mid, payment);

      console.log(
        `Iteration ${i + 1}: mid=${mid.toFixed(6)}, canPayOff=${simulation.canPayOff}, ` +
          `months=${simulation.months || 'N/A'}, remaining=${simulation.remaining?.toFixed(4) || 'N/A'}`
      );

      if (!simulation.canPayOff) {
        // Payment too low for this interest rate guess; decrease interest rate guess
        high = mid;
      } else {
        // Can pay off with this rate
        if (simulation.remaining < tolerance) {
          // Close enough, return APR estimate
          return mid * 12 * 100;
        }
        // Try higher rate to find closer match
        low = mid;
      }
    }

    return mid * 12 * 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const inputAPR = parseFloat(apr);
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      alert('Please enter Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    let monthlyRate;
    let estimatedAPR = 0;

    // If APR provided, use it. Otherwise estimate APR based on balance & payment.
    if (inputAPR && inputAPR > 0) {
      estimatedAPR = inputAPR;
      monthlyRate = inputAPR / 100 / 12;
      setAprEstimated(false);
    } else {
      estimatedAPR = estimateAPR(principal, payment);
      monthlyRate = estimatedAPR / 100 / 12;
      setAprEstimated(true);
      setApr(estimatedAPR.toFixed(2));
    }

    if (estimatedAPR > 2000) {
      alert('Estimated APR is extremely high, please check your inputs.');
      setResultsVisible(false);
      return;
    }

    if (target && target > 0) {
      // Optional: Add target months payoff calculation here later
    }

    // Simulate payoff with estimated APR and given payment
    const simulation = simulatePayoff(principal, monthlyRate, payment);

    if (!simulation.canPayOff) {
      alert('The payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    const totalPaid = principal + simulation.totalInterest;

    setResultData({
      totalInterest: simulation.totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      monthsToPayoff: simulation.months,
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
              onChange={(e) => {
                setApr(e.target.value);
                setAprEstimated(false);
              }}
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
              Calculate APR
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

            {aprEstimated && (
              <p style={{ color: '#cc0000', marginTop: '1rem' }}>
                * APR estimated from Amount Outstanding & Minimum Payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
