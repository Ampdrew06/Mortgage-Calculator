import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    firstMinPayment: 0,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);

  const minPercentForEstimation = 0.015; // 1.5%, no floor in APR estimation

  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  // Simulate full payoff with fixed monthly payment, return payoff months & total interest
  const simulateFixedPayment = (principal, monthlyRate, fixedPayment) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      const principalPaid = fixedPayment - interest;

      if (principalPaid <= 0) return { canPayOff: false };

      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: remaining <= 0,
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstMinPayment: fixedPayment,
    };
  };

  // Estimate APR by binary searching for monthly rate that results in simulation payoff time
  const estimateAPR = (principal, minPayment) => {
    let low = 0;
    let high = 0.5 / 12; // max ~4.17% monthly = 50% APR
    let mid = 0;
    const maxIterations = 100;
    const toleranceMonths = 1;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const sim = simulateFixedPayment(principal, mid, minPayment);

      if (!sim.canPayOff) {
        high = mid;
        continue;
      }

      // Target payoff months for estimate is unknown, so instead try to find APR whose first min payment equals user's
      // Here, we can try to stabilize around a reasonable payoff period ~360 months (30 years) as a heuristic

      // We'll just look at canPayOff - if it can pay off, check if months is plausible

      if (sim.months > 360) {
        low = mid;
      } else if (sim.months < 60) {
        high = mid;
      } else {
        // Within 5 years range of payoff — accept it
        return mid * 12 * 100;
      }
    }

    return mid * 12 * 100;
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(apr);
    const m = parseNumber(minPayment);
    return p > 0 && (a > 0 || m > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    const inputAPR = parseNumber(apr);
    const inputMinPayment = parseNumber(minPayment);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      // Use APR to simulate payoff with default min payment = interest + 1.5% principal (with floor)
      const monthlyRate = inputAPR / 100 / 12;

      // Calculate initial min payment as interest + 1.5% principal part or floor £30 whichever is larger
      const initialMinPayment = Math.max(30, principal * 0.015) + principal * monthlyRate;

      const sim = simulateFixedPayment(principal, monthlyRate, initialMinPayment);

      if (!sim.canPayOff) {
        setErrorMsg('Minimum payment too low to ever pay off the balance.');
        return;
      }

      setResultData({
        payoffMonths: sim.months,
        totalInterest: sim.totalInterest.toFixed(2),
        totalPaid: sim.totalPaid.toFixed(2),
        firstMinPayment: initialMinPayment.toFixed(2),
      });

      setAprEstimated(false);
      setResultsVisible(true);
      return;
    } else if (inputMinPayment && inputMinPayment > 0) {
      // Estimate APR by binary searching monthly rate to match fixed monthly payment and payoff in reasonable time
      const estimatedAPR = estimateAPR(principal, inputMinPayment);

      if (estimatedAPR <= 0) {
        setErrorMsg('Unable to estimate APR with given inputs.');
        return;
      }

      const monthlyRate = estimatedAPR / 100 / 12;
      const sim = simulateFixedPayment(principal, monthlyRate, inputMinPayment);

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

      setAprEstimated(true);
      setApr(estimatedAPR.toFixed(2));
      setResultsVisible(true);
      return;
    } else {
      setErrorMsg('Please enter either APR or Minimum Monthly Payment.');
      return;
    }
  };

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMinPayment('');
    setResultsVisible(false);
    setAprEstimated(false);
    setResultData({
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      firstMinPayment: 0,
    });
    setErrorMsg('');
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
              placeholder="Enter if known, leave blank to input Min Payment"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setErrorMsg('');
                setAprEstimated(false);
                setResultsVisible(false);
                if (e.target.value.trim() !== '') setMinPayment('');
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>
              Clear
            </button>
          </div>

          {apr.trim() === '' && (
            <div className="input-row">
              <label htmlFor="min-payment-input">Minimum Monthly Payment (£)</label>
              <input
                id="min-payment-input"
                name="minPayment"
                type="text"
                inputMode="decimal"
                placeholder="Enter min payment if APR unknown"
                value={minPayment}
                onChange={(e) => {
                  setMinPayment(e.target.value);
                  setErrorMsg('');
                  setResultsVisible(false);
                  if (e.target.value.trim() !== '') setApr('');
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button type="button" className="clear-btn" onClick={() => setMinPayment('')}>
                Clear
              </button>
            </div>
          )}

          {errorMsg && (
            <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.5rem' }}>{errorMsg}</p>
          )}

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="submit-btn ccc"
              type="submit"
              style={{ flex: 1 }}
              disabled={!canSubmit()}
              title={!canSubmit() ? 'Enter Amount Outstanding plus APR or Minimum Payment' : 'Submit'}
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
              {parseFloat(resultData.firstMinPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

            {aprEstimated && (
              <p style={{ color: '#cc0000', marginTop: '1rem' }}>
                * APR estimated from Amount Outstanding and entered Minimum Payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
