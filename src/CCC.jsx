import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
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

  const minPercent = 0.02; // 2%
  const fixedFloor = 25;   // £25 floor

  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  const simulateMinPaymentPlusInterest = (principal, monthlyRate, minPercent, fixedFloor, fixedPayment = null) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstPayment = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      const minPayment = Math.max(fixedFloor, remaining * minPercent);
      const payment = fixedPayment !== null ? fixedPayment : minPayment + interest;

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

  const calculateFixedPayment = (principal, monthlyRate, months) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  const estimateAPR = (principal, payment, minPercent, fixedFloor) => {
    let low = 0;
    let high = 0.5 / 12;
    const tolerance = 0.01;
    let mid = 0;
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const sim = simulateMinPaymentPlusInterest(principal, mid, minPercent, fixedFloor);
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

        const sim = simulateMinPaymentPlusInterest(principal, monthlyRate, minPercent, fixedFloor, fixedPayment);

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
        const sim = simulateMinPaymentPlusInterest(principal, monthlyRate, minPercent, fixedFloor);

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
      const initialMinPayment = Math.max(fixedFloor, principal * minPercent);

      const estimatedAPR = estimateAPR(principal, initialMinPayment, minPercent, fixedFloor);
      const monthlyRate = estimatedAPR / 100 / 12;
      const sim = simulateMinPaymentPlusInterest(principal, monthlyRate, minPercent, fixedFloor);

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

  const resetAll = () => {
    setBalance('');
    setApr('');
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
              title={!canSubmit() ? 'Enter Amount Out
