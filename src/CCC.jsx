import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  // User inputs
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [targetYears, setTargetYears] = useState('');

  // UI state
  const [resultsVisible, setResultsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    firstMinPayment: 0,
  });

  // Constants for the dynamic payment model
  const MIN_PAYMENT_FLOOR = 25;     // Minimum floor payment in £
  const MIN_PAYMENT_PERCENT = 0.02; // 2% of remaining balance

  // Utility to parse input strings to floats safely
  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  /**
   * Simulates payoff month-by-month with dynamic minimum payment:
   * Each month: Payment = max(floor payment, percent of remaining balance + interest)
   * Returns object with canPayOff, months, totalInterest, totalPaid, firstMinPayment.
   */
  const simulateDynamicPayment = (principal, annualRate, initialMinPayment, maxMonths = 600) => {
    const monthlyRate = annualRate / 12 / 100;
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstMinPayment = initialMinPayment;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      // Minimum payment calculation for this month
      const percentPayment = remaining * MIN_PAYMENT_PERCENT + interest;
      let payment = Math.max(MIN_PAYMENT_FLOOR, percentPayment);

      // On the very first month, if initialMinPayment is given and > payment, use that instead
      if (months === 0 && initialMinPayment && initialMinPayment > payment) {
        payment = initialMinPayment;
        firstMinPayment = initialMinPayment;
      }

      // If payment is less than interest, can't pay off loan
      if (payment < interest) {
        console.log(`Month ${months + 1}: payment too low to cover interest.`);
        return { canPayOff: false };
      }

      const principalPaid = payment - interest;
      remaining -= principalPaid;
      months++;

      // Debug log each month
      console.log(`Month ${months}: Remaining=${remaining.toFixed(2)}, Payment=${payment.toFixed(2)}, Interest=${interest.toFixed(2)}`);
    }

    return {
      canPayOff: remaining <= 0,
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstMinPayment,
    };
  };

  /**
   * Estimates APR by trying values via binary search until simulated payoff months
   * roughly matches target payoff months (default 360 months = 30 years).
   * Returns estimated APR % or -1 if no solution found.
   */
  const estimateAPR = (principal, initialMinPayment, targetMonths = 360) => {
    let low = 0;
    let high = 200; // increase max APR to 200%
    const maxIterations = 60;
    const tolerance = 48; // months, 4 years window

    for (let i = 0; i < maxIterations; i++) {
      const midAPR = (low + high) / 2;
      const sim = simulateDynamicPayment(principal, midAPR, initialMinPayment, targetMonths + tolerance);

      console.log(`Iteration ${i + 1}: APR=${midAPR.toFixed(2)}%, payoffMonths=${sim.months}, canPayOff=${sim.canPayOff}`);

      if (!sim.canPayOff) {
        high = midAPR;
      } else {
        if (Math.abs(sim.months - targetMonths) <= tolerance) {
          return midAPR;
        }

        if (sim.months > targetMonths + tolerance) {
          low = midAPR;
        } else {
          high = midAPR;
        }
      }
    }

    return -1;
  };

  /**
   * Calculates the initial minimum payment required to payoff loan in targetYears
   * using the dynamic payment model approximation.
   * Uses binary search over initial payment amount.
   */
  const calcPaymentForTargetYears = (principal, aprPercent, targetYears, maxIterations = 50) => {
    const targetMonths = Math.round(targetYears * 12);
    let low = MIN_PAYMENT_FLOOR;
    let high = principal * 0.1; // arbitrary upper bound (10% of balance)

    for (let i = 0; i < maxIterations; i++) {
      const midPayment = (low + high) / 2;
      const sim = simulateDynamicPayment(principal, aprPercent, midPayment, targetMonths + 12);

      if (!sim.canPayOff) {
        low = midPayment * 1.1; // increase payment guess
        continue;
      }

      if (sim.months > targetMonths) {
        low = midPayment;
      } else if (sim.months < targetMonths) {
        high = midPayment;
      } else {
        return midPayment;
      }
    }
    return (low + high) / 2; // best guess
  };

  // Determines if form can be submitted
  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(apr);
    const m = parseNumber(minPayment);
    return p > 0 && ((a > 0 && !m) || (m > 0 && (!a || isNaN(a))));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    const inputAPR = parseNumber(apr);
    const inputMinPayment = parseNumber(minPayment);
    const target = parseNumber(targetYears);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }

    if (inputAPR > 0 && inputMinPayment > 0) {
      setErrorMsg('Please enter either APR or Minimum Monthly Payment, not both.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      // APR known: simulate payoff with dynamic payments
      const monthsTarget = target && target > 0 ? Math.round(target * 12) : 360; // default 30 years
      const initialPayment = inputMinPayment && inputMinPayment > 0 ? inputMinPayment : MIN_PAYMENT_FLOOR;

      const sim = simulateDynamicPayment(principal, inputAPR, initialPayment, monthsTarget + 24);

      if (!sim.canPayOff) {
        setErrorMsg('Payment too low to pay off balance in target time.');
        return;
      }

      let paymentToShow = sim.firstMinPayment;
      if (target && target > 0) {
        // Calculate payment needed to hit target exactly
        paymentToShow = calcPaymentForTargetYears(principal, inputAPR, target);
      }

      setResultData({
        payoffMonths: sim.months,
        totalInterest: sim.totalInterest.toFixed(2),
        totalPaid: sim.totalPaid.toFixed(2),
        firstMinPayment: paymentToShow.toFixed(2),
      });
      setResultsVisible(true);
      return;
    }

    if ((inputAPR === 0 || isNaN(inputAPR)) && inputMinPayment && inputMinPayment > 0) {
      // APR unknown: estimate APR by simulating dynamic payments
      const estimatedAPR = estimateAPR(principal, inputMinPayment);

      if (estimatedAPR <= 0) {
        setErrorMsg('Unable to estimate APR with given inputs.');
        return;
      }

      const sim = simulateDynamicPayment(principal, estimatedAPR, inputMinPayment);

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
      return;
    }

    setErrorMsg('Please enter either a valid APR > 0 or Minimum Monthly Payment.');
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
