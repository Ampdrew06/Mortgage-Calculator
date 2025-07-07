import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [minPaymentPercent, setMinPaymentPercent] = useState('2'); // 2%
  const [minPaymentFloor, setMinPaymentFloor] = useState('25'); // £25 floor
  const [resultsVisible, setResultsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState({
    monthsToPayoff: 0,
    totalInterest: 0,
    totalPaid: 0,
    initialMinPayment: 0,
  });

  // Helper parse function
  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  // Simulate payoff with dynamic min payments (percentage + floor)
  const simulateDynamicMinPayment = (
    principal,
    monthlyRate,
    paymentPercent,
    paymentFloor,
    maxMonths = 1000
  ) => {
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    let initialMinPayment = 0;

    while (balance > 0 && months < maxMonths) {
      const interestAccrued = balance * monthlyRate;
      totalInterest += interestAccrued;

      const paymentThisMonth = Math.max(
        paymentFloor,
        balance * paymentPercent + interestAccrued
      );

      if (months === 0) initialMinPayment = paymentThisMonth;

      if (paymentThisMonth <= interestAccrued) {
        // Payment too low to cover interest; endless debt cycle
        return { canPayOff: false };
      }

      balance -= (paymentThisMonth - interestAccrued);
      months++;
    }

    return {
      canPayOff: balance <= 0,
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      initialMinPayment,
    };
  };

  // Calculate payment needed to pay off in target years (fixed payment)
  const calculateFixedPaymentForTargetYears = (principal, monthlyRate, targetMonths) => {
    if (monthlyRate === 0) return principal / targetMonths;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, targetMonths);
    const denominator = Math.pow(1 + monthlyRate, targetMonths) - 1;
    return principal * (numerator / denominator);
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(apr);
    return p > 0 && a > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    const inputAPR = parseNumber(apr);
    const paymentPercent = parseNumber(minPaymentPercent) / 100;
    const paymentFloor = parseNumber(minPaymentFloor);
    const target = parseNumber(targetYears);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }

    if (!inputAPR || inputAPR <= 0) {
      setErrorMsg('Please enter a valid APR greater than 0.');
      return;
    }

    const monthlyRate = inputAPR / 100 / 12;

    if (target && target > 0) {
      // Calculate fixed payment to meet target payoff time
      const targetMonths = Math.round(target * 12);
      const fixedPayment = calculateFixedPaymentForTargetYears(principal, monthlyRate, targetMonths);

      // Simulate payoff using fixed payment
      let balanceSim = principal;
      let totalInterest = 0;
      let months = 0;

      while (balanceSim > 0 && months < targetMonths) {
        const interestAccrued = balanceSim * monthlyRate;
        totalInterest += interestAccrued;
        const principalPaid = fixedPayment - interestAccrued;
        if (principalPaid <= 0) {
          setErrorMsg('Payment too low to pay off balance in target time.');
          return;
        }
        balanceSim -= principalPaid;
        months++;
      }

      setResultData({
        monthsToPayoff: months,
        totalInterest: totalInterest.toFixed(2),
        totalPaid: (principal + totalInterest).toFixed(2),
        initialMinPayment: fixedPayment.toFixed(2),
      });
      setResultsVisible(true);
      return;
    }

    // No target => simulate dynamic minimum payments until payoff
    const simulation = simulateDynamicMinPayment(
      principal,
      monthlyRate,
      paymentPercent,
      paymentFloor,
      1200 // max 100 years approx.
    );

    if (!simulation.canPayOff) {
      setErrorMsg(
        'Minimum payments too low to ever pay off the balance. Please increase payment floor or percent.'
      );
      return;
    }

    setResultData({
      monthsToPayoff: simulation.months,
      totalInterest: simulation.totalInterest.toFixed(2),
      totalPaid: simulation.totalPaid.toFixed(2),
      initialMinPayment: simulation.initialMinPayment.toFixed(2),
    });
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance('');
    setApr('');
    setTargetYears('');
    setMinPaymentPercent('2');
    setMinPaymentFloor('25');
    setResultsVisible(false);
    setErrorMsg('');
    setResultData({
      monthsToPayoff: 0,
      totalInterest: 0,
      totalPaid: 0,
      initialMinPayment: 0,
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
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>
              Clear
            </button>
          </div>

          <div className="input-row apr-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              name="apr"
              type="text"
              inputMode="decimal"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
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
              value={targetYears}
              onChange={(e) => {
                setTargetYears(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Leave empty to simulate min payments"
            />
            <button type="button" className="clear-btn" onClick={() => setTargetYears('')}>
              Clear
            </button>
          </div>

          {/* Optional inputs to tweak min payment % and floor */}
          <div className="input-row">
            <label htmlFor="min-payment-percent-input">Min Payment % of Balance</label>
            <input
              id="min-payment-percent-input"
              name="minPaymentPercent"
              type="text"
              inputMode="decimal"
              value={minPaymentPercent}
              onChange={(e) => {
                setMinPaymentPercent(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setMinPaymentPercent('2')}>
              Reset
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="min-payment-floor-input">Fixed Floor Min Payment (£)</label>
            <input
              id="min-payment-floor-input"
              name="minPaymentFloor"
              type="text"
              inputMode="decimal"
              value={minPaymentFloor}
              onChange={(e) => {
                setMinPaymentFloor(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setMinPaymentFloor('25')}>
              Reset
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
              title={!canSubmit() ? 'Enter Amount Outstanding plus APR' : 'Submit'}
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
              <strong>Initial Minimum Payment:</strong> £
              {parseFloat(resultData.initialMinPayment).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>Estimated Payoff Time:</strong> {(resultData.monthsToPayoff / 12).toFixed(1)} years
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £
              {parseFloat(resultData.totalInterest).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
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
