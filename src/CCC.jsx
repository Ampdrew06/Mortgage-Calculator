import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    firstMinPayment: 0,
    requiredPaymentForTarget: 0,
    isTargetMode: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);

  // Tune these constants to fit your expected results:
  const minPercent = 0.012; // 1.2% of balance, closer to typical card minimums
  const fixedFloor = 25;    // £25 floor

  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  // Calculate initial min payment: floor or % of balance + interest on initial balance
  const calculateInitialMinPayment = (principal, monthlyRate) => {
    const interest = principal * monthlyRate;
    const principalPart = Math.max(fixedFloor, principal * minPercent);
    return interest + principalPart;
  };

  // Simulate paying min payments month by month
  const simulatePayments = (principal, monthlyRate, minPercent, fixedFloor, fixedPayment = null) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstMinPayment = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      const principalPart = Math.max(fixedFloor, remaining * minPercent);

      const payment = fixedPayment !== null ? fixedPayment : interest + principalPart;

      if (months === 0) firstMinPayment = payment;

      const principalPaid = payment - interest;
      if (principalPaid <= 0) return { canPayOff: false };

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

  const calculateFixedPayment = (principal, monthlyRate, months) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  // Estimate APR by binary search trying to match initial min payment calculated
  const estimateAPR = (principal, targetMinPayment, minPercent, fixedFloor) => {
    let low = 0;
    let high = 0.5 / 12;
    const tolerance = 0.01;
    let mid = 0;
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;

      const testMinPayment = calculateInitialMinPayment(principal, mid);
      if (Math.abs(testMinPayment - targetMinPayment) < tolerance) {
        return mid * 12 * 100;
      }

      if (testMinPayment > targetMinPayment) {
        high = mid;
      } else {
        low = mid;
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
    const target = parseNumber(targetYears);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      const monthlyRate = inputAPR / 100 / 12;

      if (target && target > 0) {
        const targetMonths = Math.round(target * 12);
        const fixedPayment = calculateFixedPayment(principal, monthlyRate, targetMonths);

        const sim = simulatePayments(principal, monthlyRate, minPercent, fixedFloor, fixedPayment);

        if (!sim.canPayOff) {
          setErrorMsg('Fixed payment too low to pay off balance in target years.');
          return;
        }

        setResultData({
          payoffMonths: sim.months,
          totalInterest: sim.totalInterest.toFixed(2),
          totalPaid: sim.totalPaid.toFixed(2),
          firstMinPayment: sim.firstMinPayment.toFixed(2),
          requiredPaymentForTarget: fixedPayment.toFixed(2),
          isTargetMode: true,
        });
        setAprEstimated(false);
        setResultsVisible(true);
        return;
      } else {
        const sim = simulatePayments(principal, monthlyRate, minPercent, fixedFloor);

        if (!sim.canPayOff) {
          setErrorMsg('Minimum payment too low to ever pay off the balance.');
          return;
        }

        setResultData({
          payoffMonths: sim.months,
          totalInterest: sim.totalInterest.toFixed(2),
          totalPaid: sim.totalPaid.toFixed(2),
          firstMinPayment: sim.firstMinPayment.toFixed(2),
          requiredPaymentForTarget: 0,
          isTargetMode: false,
        });
        setAprEstimated(false);
        setResultsVisible(true);
        return;
      }
    } else if (inputMinPayment && inputMinPayment > 0) {
      // Estimate APR using the provided min payment
      const estimatedAPR = estimateAPR(principal, inputMinPayment, minPercent, fixedFloor);
      const monthlyRate = estimatedAPR / 100 / 12;

      const sim = simulatePayments(principal, monthlyRate, minPercent, fixedFloor, inputMinPayment);

      if (!sim.canPayOff) {
        setErrorMsg('Minimum payment too low to ever pay off the balance.');
        return;
      }

      setResultData({
        payoffMonths: sim.months,
        totalInterest: sim.totalInterest.toFixed(2),
        totalPaid: sim.totalPaid.toFixed(2),
        firstMinPayment: inputMinPayment.toFixed(2),
        requiredPaymentForTarget: 0,
        isTargetMode: false,
      });
      setAprEstimated(true);
      setApr(estimatedAPR.toFixed(2));
      setResultsVisible(true);
    } else {
      setErrorMsg('Please enter either APR or Minimum Monthly Payment.');
    }
  };

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMinPayment('');
    setTargetYears('');
    setResultsVisible(false);
    setAprEstimated(false);
    setResultData({
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      firstMinPayment: 0,
      requiredPaymentForTarget: 0,
      isTargetMode: false,
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
