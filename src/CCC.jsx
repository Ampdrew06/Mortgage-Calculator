import React, { useState } from 'react';
import PieChart from './PieChart'; // your shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    estimatedAPR: 0,
    warning: '',
    monthsToPayoff: 0,
    totalInterestPaid: 0,
    totalPaid: 0,
  });

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setResultsVisible(false);
    setResultData({
      estimatedAPR: 0,
      warning: '',
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
    });
  };

  // Simulate payoff given principal, monthly rate, payment - returns months to pay off or -1 if payment too low
  const simulatePayoff = (principal, monthlyRate, payment) => {
    let balance = principal;
    let months = 0;
    let totalInterest = 0;

    while (balance > 0 && months < 1000) {
      const interest = balance * monthlyRate;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        // Payment too low to ever pay off
        return { months: -1, totalInterest: 0 };
      }
      balance -= principalPaid;
      totalInterest += interest;
      months++;
    }
    return { months, totalInterest };
  };

  // Binary search to estimate APR based on principal and payment
  const estimateAPR = (principal, payment) => {
    let low = 0.0;
    let high = 1.0; // 100% monthly rate (1200% APR)
    let mid = 0.0;
    let resultMonths = 0;
    let resultInterest = 0;

    // If payment less than balance (lowest possible interest) return -1 immediately
    if (payment <= principal * low) return { apr: -1 };

    // Binary search for monthly rate
    for (let i = 0; i < 50; i++) {
      mid = (low + high) / 2;
      const sim = simulatePayoff(principal, mid, payment);
      if (sim.months === -1) {
        // payment too low, increase rate
        low = mid;
      } else {
        // payment sufficient, try lower rate
        high = mid;
        resultMonths = sim.months;
        resultInterest = sim.totalInterest;
      }
    }

    return {
      apr: mid * 12 * 100, // convert monthly rate to APR %
      months: resultMonths,
      totalInterest: resultInterest,
      totalPaid: principal + resultInterest,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));

    if (!principal || !payment) {
      setResultData({
        estimatedAPR: 0,
        warning: 'Please enter valid Amount Outstanding and Minimum Monthly Payment.',
      });
      setResultsVisible(true);
      return;
    }

    if (apr && apr.trim() !== '') {
      // Use user-provided APR
      setResultData({
        estimatedAPR: parseFloat(apr),
        warning: '',
      });
      setResultsVisible(true);
      return;
    }

    // Estimate APR
    const est = estimateAPR(principal, payment);

    if (est.apr === -1) {
      setResultData({
        estimatedAPR: 0,
        warning: 'The payment is too low to ever pay off the balance.',
      });
      setResultsVisible(true);
      return;
    }

    setResultData({
      estimatedAPR: est.apr.toFixed(2),
      warning: '* APR estimated from minimum payment',
      monthsToPayoff: est.months,
      totalInterestPaid: est.totalInterest.toFixed(2),
      totalPaid: est.totalPaid.toFixed(2),
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
              value={apr || (resultData.estimatedAPR ? resultData.estimatedAPR : '')}
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
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setMonthlyPayment('')}>
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
            {resultData.estimatedAPR > 0 && (
              <p>
                <strong>Estimated APR:</strong> {resultData.estimatedAPR}%
              </p>
            )}
            {resultData.monthsToPayoff > 0 && (
              <p>
                <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
              </p>
            )}
            {resultData.totalInterestPaid > 0 && (
              <p>
                <strong>Total Interest Paid:</strong> £{resultData.totalInterestPaid}
              </p>
            )}
            {resultData.totalPaid > 0 && (
              <p>
                <strong>Total Paid:</strong> £{resultData.totalPaid}
              </p>
            )}
            {resultData.warning && <p style={{ color: 'red' }}>{resultData.warning}</p>}

            {(resultData.totalInterestPaid > 0 || resultData.estimatedAPR > 0) && (
              <PieChart
                interest={parseFloat(resultData.totalInterestPaid)}
                principal={parseFloat(balance.replace(/,/g, ''))}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
