import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [aprInput, setAprInput] = useState('');
  const [minPaymentInput, setMinPaymentInput] = useState('');
  const [overpaymentInput, setOverpaymentInput] = useState('');
  const [targetYearsInput, setTargetYearsInput] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    initialMinPayment: 0,
    fixedPaymentForTarget: null,
  });

  const MIN_PAYMENT_FLOOR = 25;
  const MIN_PAYMENT_PERCENT = 0.015; // 1.5%

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  const calculateFixedPayment = (principal, monthlyRate, months) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  // Updated simulatePayoff function:
  // Minimum monthly payment is now max(floor, percent of balance + interest)
  // User input min payment used only for first month
  // Overpayment added each month
  // Target months fixed payment if target set
  const simulatePayoff = (principal, annualRate, initialMinPayment, overpayment, targetMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    let fixedPayment = null;
    if (targetMonths && targetMonths > 0) {
      fixedPayment = calculateFixedPayment(principal, monthlyRate, targetMonths);
      if (overpayment > 0) fixedPayment += overpayment;
    }

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      let payment;

      if (fixedPayment !== null) {
        payment = fixedPayment;
      } else {
        if (months === 0 && initialMinPayment > 0) {
          payment = initialMinPayment + (overpayment > 0 ? overpayment : 0);
        } else {
          // Add interest to min payment calculation (key change)
          const dynamicMinPayment = Math.max(
            MIN_PAYMENT_FLOOR,
            remaining * MIN_PAYMENT_PERCENT + interest
          );
          payment = dynamicMinPayment + (overpayment > 0 ? overpayment : 0);
        }
      }

      if (payment < interest) {
        return {
          canPayOff: false,
          payoffMonths: months,
          totalInterest,
          totalPaid: principal + totalInterest,
          firstMonthMinPayment: initialMinPayment,
          fixedPaymentForTarget: fixedPayment,
        };
      }

      const principalPaid = payment - interest;
      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: remaining <= 0,
      payoffMonths: months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstMonthMinPayment: initialMinPayment,
      fixedPaymentForTarget: fixedPayment,
    };
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(aprInput);
    const m = parseNumber(minPaymentInput);
    return p > 0 && (a > 0 || m > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResultsVisible(false);

    const principal = parseNumber(balance);
    let apr = parseNumber(aprInput);
    let minPayment = parseNumber(minPaymentInput);
    const overpayment = parseNumber(overpaymentInput) || 0;
    const targetYears = parseNumber(targetYearsInput);

    if (!principal || principal <= 0) {
      setErrorMsg('Please enter a valid Amount Outstanding.');
      return;
    }

    if (!apr || apr <= 0) apr = 25;

    const targetMonths = targetYears && targetYears > 0 ? Math.round(targetYears * 12) : null;

    if (!minPayment || minPayment <= 0) {
      minPayment = Math.max(MIN_PAYMENT_FLOOR, principal * MIN_PAYMENT_PERCENT);
    }

    const sim = simulatePayoff(principal, apr, minPayment, overpayment, targetMonths);

    if (!sim.canPayOff) {
      setErrorMsg('Payment too low to ever pay off the balance.');
      return;
    }

    setResultData({
      payoffMonths: sim.payoffMonths,
      totalInterest: sim.totalInterest.toFixed(2),
      totalPaid: sim.totalPaid.toFixed(2),
      initialMinPayment: sim.firstMonthMinPayment.toFixed(2),
      fixedPaymentForTarget: sim.fixedPaymentForTarget ? sim.fixedPaymentForTarget.toFixed(2) : null,
    });

    setApr(apr.toFixed(2));
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance('');
    setAprInput('');
    setMinPaymentInput('');
    setOverpaymentInput('');
    setTargetYearsInput('');
    setErrorMsg('');
    setResultsVisible(false);
    setResultData({
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      initialMinPayment: 0,
      fixedPaymentForTarget: null,
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
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={e => { setBalance(e.target.value); setErrorMsg(''); setResultsVisible(false); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter if known or leave blank for 25%"
              value={aprInput}
              onChange={e => { setAprInput(e.target.value); setErrorMsg(''); setResultsVisible(false); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setAprInput('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="min-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="min-payment-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter if known, or leave blank to auto-calc first payment"
              value={minPaymentInput}
              onChange={e => { setMinPaymentInput(e.target.value); setErrorMsg(''); setResultsVisible(false); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setMinPaymentInput('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="overpayment-input">Overpayment (£, optional)</label>
            <input
              id="overpayment-input"
              type="text"
              inputMode="decimal"
              placeholder="Extra monthly payment"
              value={overpaymentInput}
              onChange={e => { setOverpaymentInput(e.target.value); setErrorMsg(''); setResultsVisible(false); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setOverpaymentInput('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="target-years-input">Target Payoff Time (Years, optional)</label>
            <input
              id="target-years-input"
              type="text"
              inputMode="decimal"
              placeholder="Leave blank if no target"
              value={targetYearsInput}
              onChange={e => { setTargetYearsInput(e.target.value); setErrorMsg(''); setResultsVisible(false); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setTargetYearsInput('')}>Clear</button>
          </div>

          {errorMsg && (
            <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.5rem' }}>{errorMsg}</p>
          )}

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="submit-btn ccc"
              type="submit"
              disabled={!canSubmit()}
              title={!canSubmit() ? 'Enter Amount Outstanding and APR or Min Payment' : 'Submit'}
              style={{ flex: 1 }}
            >
              Submit
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={resetAll}
              style={{ flex: 1 }}
            >
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            <p><strong>APR Used:</strong> {apr}%</p>
            <p><strong>Initial Minimum Payment:</strong> £{resultData.initialMinPayment}</p>
            {resultData.fixedPaymentForTarget && (
              <p><strong>Fixed Payment for Target:</strong> £{resultData.fixedPaymentForTarget}</p>
            )}
            <p><strong>Estimated Payoff Time:</strong> {(resultData.payoffMonths / 12).toFixed(1)} years</p>
            <p><strong>Total Interest Paid:</strong> £{parseFloat(resultData.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p><strong>Total Paid:</strong> £{parseFloat(resultData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>

            <PieChart
              interest={parseFloat(resultData.totalInterest)}
              principal={parseFloat(balance.replace(/,/g, ''))}
              colors={['#ff4d4f', '#4aa4e3']}
            />

            <p className="chart-labels" style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
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
