import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    firstMinPayment: 0,
  });

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  const simulateFixedPayment = (principal, monthlyRate, fixedPayment, maxMonths = 1000) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < maxMonths) {
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

  const estimateAPR = (principal, fixedPayment) => {
    let low = 0;
    let high = 0.5 / 12;
    let mid = 0;
    const maxIterations = 100;
    const targetMonths = 360;
    const tolerance = 1;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const sim = simulateFixedPayment(principal, mid, fixedPayment);

      if (!sim.canPayOff) {
        high = mid;
      } else {
        if (Math.abs(sim.months - targetMonths) <= tolerance) {
          return mid * 12 * 100;
        }
        if (sim.months > targetMonths) {
          low = mid;
        } else {
          high = mid;
        }
      }
    }
    return mid * 12 * 100;
  };

  const calcFixedPaymentForTargetYears = (principal, monthlyRate, targetMonths) => {
    if (monthlyRate === 0) return principal / targetMonths;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, targetMonths);
    const denominator = Math.pow(1 + monthlyRate, targetMonths) - 1;
    return principal * (numerator / denominator);
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(apr);
    const m = parseNumber(minPayment);
    return p > 0 && ((a > 0 && m === 0) || (m > 0 && (a === 0 || isNaN(a))));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    const inputAPR = parseNumber(apr);
    const inputMinPayment = parseNumber(minPayment);
    const target = parseNumber(targetYears);

    console.log('Balance:', balance, 'Parsed:', principal);
    console.log('APR Input:', apr, 'Parsed:', inputAPR);
    console.log('Min Payment Input:', minPayment, 'Parsed:', inputMinPayment);
    console.log('Target Years:', targetYears, 'Parsed:', target);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      console.log('Invalid principal input.');
      return;
    }

    if (inputAPR > 0 && inputMinPayment > 0) {
      setErrorMsg('Please enter either APR or Minimum Monthly Payment, not both.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      console.log('APR path taken.');
      const monthlyRate = inputAPR / 100 / 12;

      if (target && target > 0) {
        const targetMonths = Math.round(target * 12);
        const fixedPayment = calcFixedPaymentForTargetYears(principal, monthlyRate, targetMonths);

        const sim = simulateFixedPayment(principal, monthlyRate, fixedPayment, targetMonths);

        if (!sim.canPayOff) {
          setErrorMsg('Payment too low to pay off balance in target time.');
          console.log('Payment too low for target payoff.');
          return;
        }

        setResultData({
          payoffMonths: sim.months,
          totalInterest: sim.totalInterest.toFixed(2),
          totalPaid: sim.totalPaid.toFixed(2),
          firstMinPayment: fixedPayment.toFixed(2),
        });
        setResultsVisible(true);
        return;
      }

      const fixedPayment = calcFixedPaymentForTargetYears(principal, monthlyRate, 360);
      const sim = simulateFixedPayment(principal, monthlyRate, fixedPayment);

      if (!sim.canPayOff) {
        setErrorMsg('Minimum payment too low to ever pay off the balance.');
        console.log('Payment too low for 30 year payoff.');
        return;
      }

      setResultData({
        payoffMonths: sim.months,
        totalInterest: sim.totalInterest.toFixed(2),
        totalPaid: sim.totalPaid.toFixed(2),
        firstMinPayment: fixedPayment.toFixed(2),
      });
      setResultsVisible(true);
      return;
    }

    if ((inputAPR === 0 || isNaN(inputAPR)) && inputMinPayment && inputMinPayment > 0) {
      console.log('Min payment estimation path taken.');
      const estimatedAPR = estimateAPR(principal, inputMinPayment);

      if (estimatedAPR <= 0) {
        setErrorMsg('Unable to estimate APR with given inputs.');
        console.log('APR estimation failed.');
        return;
      }

      const monthlyRate = estimatedAPR / 100 / 12;
      const sim = simulateFixedPayment(principal, monthlyRate, inputMinPayment);

      if (!sim.canPayOff) {
        setErrorMsg('Minimum payment too low to ever pay off the balance.');
        console.log('Payment too low for payoff.');
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
      return;
    }

    setErrorMsg('Please enter either a valid APR > 0 or Minimum Monthly Payment.');
    console.log('No valid APR or min payment input.');
  };

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMinPayment('');
    setTargetYears('');
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
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              name="apr"
              type="text"
              inputMode="decimal"
              placeholder="Enter APR if known"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setErrorMsg('');
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
              title={
                !canSubmit()
                  ? 'Enter Amount Outstanding plus either APR or Minimum Monthly Payment'
                  : 'Submit'
              }
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
              {parseFloat(resultData.firstMinPayment).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>Estimated Payoff Time:</strong> {(resultData.payoffMonths / 12).toFixed(1)} years
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
