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
    firstMinPayment: 0,
    requiredPaymentForTarget: 0,
    isTargetMode: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [aprEstimated, setAprEstimated] = useState(false);

  // Constants for minimum payment calculation (hidden from user)
  const minPercent = 0.02; // 2%
  const fixedFloor = 25;   // £25 floor

  const parseNumber = (val) => {
    if (!val) return NaN;
    return parseFloat(val.toString().replace(/,/g, ''));
  };

  // Simulation of payments: min payment + interest added each month
  const simulateMinPaymentPlusInterest = (principal, monthlyRate, minPercent, fixedFloor, fixedPayment = null) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;
    let firstMinPayment = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;

      const minPayment = Math.max(fixedFloor, remaining * minPercent);
      const payment = fixedPayment !== null ? fixedPayment : minPayment + interest;

      if (months === 0) firstMinPayment = minPayment; // Only min payment part, exclude interest

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
      } else if (Math.abs(sim.firstMinPayment - payment) < tolerance) {
        return mid * 12 * 100;
      } else if (sim.firstMinPayment > payment) {
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
          firstMinPayment: sim.firstMinPayment.toFixed(2),
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
          firstMinPayment: sim.firstMinPayment.toFixed(2),
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
        firstMinPayment: sim.firstMinPayment.toFixed(2),
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
      firstMinPayment: 0,
      requiredPaymentForTarget: 0,
      isTargetMode: fal
