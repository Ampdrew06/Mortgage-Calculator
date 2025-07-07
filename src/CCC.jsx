import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  // States
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPaymentPercent, setMinPaymentPercent] = useState('2'); // default 2% min payment %
  const [fixedFloor, setFixedFloor] = useState('25'); // default £25 fixed floor min payment
  const [targetYears, setTargetYears] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    initialMinPayment: 0,
    requiredPaymentForTarget: 0,
    isTargetMode: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);

  // Helper: parse floats safely
  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  // Simulate payoff with realistic dynamic min payments each month
  // minPercent as decimal (e.g. 0.02 for 2%)
  // fixedFloor as minimum payment floor (£)
  // paymentOverride: if provided, fixed payment each month (target mode)
  // maxMonths limit to avoid infinite loops
  const simulateDynamicMinPayment = (principal, monthlyRate, minPercent, fixedFloor, paymentOverride = null) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstPayment = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      let payment;
      if (paymentOverride !== null) {
        payment = paymentOverride; // fixed payment (target mode)
      } else {
        // realistic min payment = max fixed floor, percent of balance + interest
        payment = Math.max(fixedFloor, remaining * minPercent + interest);
      }
      if (months === 0) firstPayment = payment;

      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        return { canPayOff: false };
      }
      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: remaining <= 0,
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstPayment,
    };
  };

  // Calculate fixed monthly payment to pay off principal in given months (amortized loan calc)
  const calculateFixedPayment = (principal, monthlyRate, months) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  // Estimate APR given principal and monthly payment (binary search)
  const estimateAPR = (principal, payment, minPercent, fixedFloor) => {
    let low = 0;
    let high = 0.5 / 12; // ~50% APR monthly rate
    const tolerance = 0.01;
    let mid = 0;
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const sim = simulateDynamicMinPayment(principal, mid, minPercent, fixedFloor);
      if (!sim.canPayOff) {
        high = mid;
      } else if (Math.abs(sim.firstPayment - payment) < tolerance) {
        return mid * 12 * 100;
      } else if (sim.firstPayment > payment) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return mid * 12 * 100;
  };

  // Validation for Submit
  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(apr);
    const t = parseNumber(targetYears);
    return p > 0 && (a > 0 || t > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    const inputAPR = parseNumber(apr);
    const minPercent = parseNumber(minPaymentPercent) / 100;
    const floor = parseNumber(fixedFloor);
    const target = parseNumber(targetYears);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }
    if (!minPercent || minPercent <= 0) {
      setErrorMsg('Please enter a valid Minimum Payment Percentage.');
      return;
    }
    if (!floor || floor <= 0) {
      setErrorMsg('Please enter a valid Fixed Floor Minimum Payment.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      const monthlyRate = inputAPR / 100 / 12;
      if (target && target > 0) {
        // Target payoff mode: calculate fixed payment needed
        const targetMonths = Math.round(target * 12);
        const fixedPayment = calculateFixedPayment(principal, monthlyRate, targetMonths);

        // Simulate payoff using fixed payment
        const sim = simulateDynamicMinPayment(principal, monthlyRate, minPercent, floor, fixedPayment);

        if (!sim.canPayOff) {
          setErrorMsg('Fixed payment too low to pay off balance in target years.');
          return;
        }

        setResultData({
          payoffMonths: sim.months,
          totalInterest: sim.totalInterest.toFixed(2),
          totalPaid: sim.totalPaid.toFixed(2),
          initialMinPayment: sim.firstPayment.toFixed(2),
          requiredPaymentForTarget: fixedPayment.toFixed(2),
          isTargetMode: true,
        });
        setAprEstimated(false);
        setResultsVisible(true);
        return;
      } else {
        // No target: simulate with dynamic min payments
        const sim = simulateDynamicMinPayment(principal, monthlyRate, minPercent, floor);

        if (!sim.canPayOff) {
          setErrorMsg('Minimum payment too low to ever pay off the balance.');
          return;
        }

        setResultData({
          payoffMonths: sim.months,
          totalInterest: sim.totalInterest.toFixed(2),
          totalPaid: sim.totalPaid.toFixed(2),
          initialMinPayment: sim.firstPayment.toFixed(2),
          requiredPaymentForTarget: 0,
          isTargetMode: false,
        });
        setAprEstimated(false);
        setResultsVisible(true);
        return;
      }
    } else {
      // APR unknown: estimate APR from dynamic minimum payment
      // Use initial min payment formula as approximation for monthly payment
      const initialMinPayment = Math.max(floor, principal * minPercent);

      const estimatedAPR = estimateAPR(principal, initialMinPayment, minPercent, floor);
      const monthlyRate = estimatedAPR / 100 / 12;
      const sim = simulateDynamicMinPayment(principal, monthlyRate, minPercent, floor);

      if (!sim.canPayOff) {
        setErrorMsg('Minimum payment too low to ever pay off the balance.');
        return;
      }

      setResultData({
        payoffMonths: sim.months,
        totalInterest: sim.totalInterest.toFixed(2),
        totalPaid: sim.totalPaid.toFixed(2),
        initialMinPayment: sim.firstPayment.toFixed(2),
        requiredPaymentForTarget: 0,
        isTargetMode: false,
      });
      setAprEstimated(true);
      setApr(estimatedAPR.toFixed(2));
      setResultsVisible(true);
    }
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
              placeholder="Enter if known, leave blank to estimate"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setErrorMsg('');
                setAprEstimated(false);
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
            <label htmlFor="min-percent-input">Minimum Payment % of Balance</label>
            <input
              id="min-percent-input"
              name="minPercent"
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
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="fixed-floor-input">Fixed Floor Minimum Payment (£)</label>
            <input
              id="fixed-floor-input"
              name="fixedFloor"
              type="text"
              inputMode="decimal"
              value={fixedFloor}
              onChange={(e) => {
                setFixedFloor(e.target.value);
                setErrorMsg('');
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setFixedFloor('25')}>
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
              title={!canSubmit() ? 'Enter Amount Outstanding plus APR or Target Years' : 'Submit'}
            >
              Submit
            </button>
            <button type="button" className="reset-btn" onClick={() => {
              setBalance('');
              setApr('');
              setMinPaymentPercent('2');
              setFixedFloor('25');
              setTargetYears('');
              setResultsVisible(false);
              setAprEstimated(false);
              setResultData({
                payoffMonths: 0,
                totalInterest: 0,
                totalPaid: 0,
                initialMinPayment: 0,
                requiredPaymentForTarget: 0,
                isTargetMode: false,
              });
              setErrorMsg('');
            }} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Initial Minimum Payment:</strong> £
              {parseFloat(resultData.initialMinPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>

            {resultData.isTargetMode ? (
              <>
                <p>
                  <strong>Fixed Payment to Meet Target:</strong> £
                  {parseFloat(resultData.requiredPaymentForTarget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p>
                  <strong>Estimated Payoff Time:</strong>{' '}
                  {(resultData.payoffMonths / 12).toFixed(1)} years (payments will decrease over time)
                </p>
              </>
            ) : (
              <p>
                <strong>Estimated Payoff Time:</strong> {(resultData.payoffMonths / 12).toFixed(1)} years
              </p>
            )}

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

            {aprEstimated && (
              <p style={{ color: '#cc0000', marginTop: '1rem' }}>
                * APR estimated from Amount Outstanding and initial minimum payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
