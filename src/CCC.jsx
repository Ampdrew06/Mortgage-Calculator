import React, { useState } from 'react';
import PieChart from './PieChart'; // Assuming you use the shared PieChart component
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

  // Function to check if a given monthly rate can pay off balance with given payment
  const canPayOff = (principal, monthlyRate, payment, maxMonths = 1000) => {
    let balance = principal;
    for (let month = 0; month < maxMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) return false; // Payment too low to cover interest
      balance -= principalPaid;
      if (balance <= 0) return true; // Paid off
    }
    return false; // Not paid off within maxMonths
  };

  // Estimate APR given principal and payment using binary search on monthlyRate
  const estimateAPR = (principal, payment) => {
    const precision = 0.0000001;
    let low = 0;
    let high = 2; // 200% APR max, monthly rate = 2
    let mid;
    let maxIterations = 50;

    // If payment less than minimum interest, no payoff possible
    if (payment <= principal * low) return -1;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      if (canPayOff(principal, mid, payment)) {
        high = mid;
      } else {
        low = mid;
      }
      if (high - low < precision) break;
    }
    return high * 12 * 100; // Convert monthly rate to annual percentage rate
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = parseFloat(apr);
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseInt(targetMonths);

    if (!principal || !payment) {
      alert('Please enter Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    let monthlyRate;
    let estimatedAPR = null;
    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    // If APR is blank, estimate it from principal & payment
    if (!annualRate) {
      estimatedAPR = estimateAPR(principal, payment);
      if (estimatedAPR === -1) {
        alert('The payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        setAprEstimated(false);
        return;
      } else {
        annualRate = estimatedAPR;
        setApr(annualRate.toFixed(2));
        setAprEstimated(true);
      }
    } else {
      setAprEstimated(false);
    }

    monthlyRate = annualRate / 100 / 12;

    // If user entered target months, compute payoff for that period (optional)
    if (target && !isNaN(target) && target > 0) {
      // Calculate required monthly payment for target months
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      months = target;
      let balanceTemp = principal;
      totalInterest = 0;
      for (let i = 0; i < months; i++) {
        const interest = balanceTemp * monthlyRate;
        totalInterest += interest;
        const principalPaid = requiredPayment - interest;
        balanceTemp -= principalPaid;
      }
      remaining = balanceTemp;
      setMonthlyPayment(requiredPayment.toFixed(2));
    } else {
      // Calculate months to pay off with given payment
      while (remaining > 0 && months < 1000) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) {
          alert('The payment is too low to ever pay off the balance.');
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
            {aprEstimated && (
              <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.3rem' }}>
                * APR estimated from Amount Outstanding & Minimum Payment
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

            <PieChart interest={parseFloat(resultData.totalInterest)} principal={parseFloat(balance.replace(/,/g, ''))} />

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
