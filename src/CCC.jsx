import React, { useState } from 'react';
import PieChart from './PieChart';
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
    calculatedMinPayment: 0,
  });
  const [aprEstimated, setAprEstimated] = useState(false);
  const [paymentCalculatedFromAPR, setPaymentCalculatedFromAPR] = useState(false);

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setPaymentCalculatedFromAPR(false);
    setResultData({
      totalInterest: 0,
      totalPaid: 0,
      monthsToPayoff: 0,
      calculatedMinPayment: 0,
    });
  };

  const simulatePayoff = (principal, monthlyRate, payment) => {
    let remaining = principal;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 1000) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPaid = payment - interest;
      if (principalPaid <= 0) {
        return { canPayOff: false };
      }
      remaining -= principalPaid;
      months++;
    }

    return {
      canPayOff: true,
      months,
      totalInterest,
      remaining,
    };
  };

  const estimateAPR = (principal, payment) => {
    let low = 0;
    let high = 0.5 / 12; // monthly rate max ~4.17% (50% APR)
    let mid = 0;
    const maxIterations = 50;
    const tolerance = 0.01;

    for (let i = 0; i < maxIterations; i++) {
      mid = (low + high) / 2;
      const simulation = simulatePayoff(principal, mid, payment);

      console.log(
        `Iteration ${i + 1}: APR guess ${(mid * 12 * 100).toFixed(2)}%, canPayOff=${simulation.canPayOff}, ` +
          `months=${simulation.months || 'N/A'}, remaining=${simulation.remaining?.toFixed(4) || 'N/A'}`
      );

      if (!simulation.canPayOff) {
        high = mid;
      } else {
        if (simulation.remaining < tolerance) {
          return mid * 12 * 100;
        }
        low = mid;
      }
    }
    return mid * 12 * 100;
  };

  const calculateMonthlyPayment = (principal, monthlyRate, months) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const inputAPR = parseFloat(apr);
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    let target = parseInt(targetMonths);

    if (!principal) {
      alert('Please enter Amount Outstanding.');
      return;
    }

    if (inputAPR && inputAPR > 0) {
      if (!target || target <= 0) target = 36;

      const monthlyRate = inputAPR / 100 / 12;
      const calculatedPayment = calculateMonthlyPayment(principal, monthlyRate, target);

      setPaymentCalculatedFromAPR(true);
      setAprEstimated(false);
      setApr(inputAPR.toFixed(2));
      setMonthlyPayment(calculatedPayment.toFixed(2));
      setTargetMonths(target.toString());

      const simulation = simulatePayoff(principal, monthlyRate, calculatedPayment);

      if (!simulation.canPayOff) {
        alert('Calculated payment is too low to pay off balance in target months.');
        setResultsVisible(false);
        return;
      }

      setResultData({
        totalInterest: simulation.totalInterest.toFixed(2),
        totalPaid: (principal + simulation.totalInterest).toFixed(2),
        monthsToPayoff: simulation.months,
        calculatedMinPayment: calculatedPayment.toFixed(2),
      });

      setResultsVisible(true);
      return;
    }

    if (!payment) {
      alert('Please enter Minimum Monthly Payment or APR and Target months.');
      return;
    }

    const estimatedAPR = estimateAPR(principal, payment);
    const monthlyRate = estimatedAPR / 100 / 12;

    setAprEstimated(true);
    setPaymentCalculatedFromAPR(false);
    setApr(estimatedAPR.toFixed(2));

    const simulation = simulatePayoff(principal, monthlyRate, payment);

    if (!simulation.canPayOff) {
      alert('The payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    setResultData({
      totalInterest: simulation.totalInterest.toFixed(2),
      totalPaid: (principal + simulation.totalInterest).toFixed(2),
      monthsToPayoff: simulation.months,
      calculatedMinPayment: 0,
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
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
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
              placeholder="Enter if known, leave blank to estimate"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={apr}
              onChange={(e) => {
                setApr(e.target.value);
                setAprEstimated(false);
                setPaymentCalculatedFromAPR(false);
              }}
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
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setMonthlyPayment('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="target-months-input">Target (Months)</label>
            <input
              id="target-months-input"
              name="targetMonths"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setTargetMonths('')}>
              Clear
            </button>
          </div>

          <div className="button-row" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="submit-btn ccc" type="submit" style={{ flex: 1 }}>
              Submit
            </button>
            <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            {paymentCalculatedFromAPR ? (
              <>
                <p>
                  <strong>Minimum Payment to Pay Off in {targetMonths || '36'} Months:</strong> £
                  {parseFloat(resultData.calculatedMinPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p>
                  <strong>Estimated Months to Pay Off:</strong> {resultData.monthsToPayoff}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
                </p>
              </>
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
              colors={['#ff4d4f', '#4aa4e3']} // red and blue for CCC theme
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
                * APR estimated from Amount Outstanding & Minimum Payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
