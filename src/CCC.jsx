import React, { useState } from 'react';
import PieChart from './PieChart'; // shared PieChart component
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
  });
  const [aprEstimated, setAprEstimated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      setErrorMessage('Please enter valid Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    let currentAPR = parseFloat(apr);

    // Estimate APR if empty or invalid
    if (!currentAPR || currentAPR <= 0) {
      // Early check: If payment <= interest of first month at some high APR, payment will never pay off
      // We assume max APR to test: 500% (very high for safety)
      const maxAPR = 5; // 500% annual = 5 monthly rate approx (for binary search upper bound)
      const monthlyRateHigh = maxAPR / 12;
      const firstMonthInterestHigh = principal * monthlyRateHigh;
      if (payment <= firstMonthInterestHigh) {
        setErrorMessage('Payment is too low to ever pay off the balance.');
        return;
      }

      // Binary search between 0% and 500% APR
      let low = 0;
      let high = maxAPR;
      let mid;
      let estimatedAPR = 0;

      for (let i = 0; i < 25; i++) { // increased iterations for precision
        mid = (low + high) / 2;
        const monthlyRateTest = mid / 12;
        let balanceTest = principal;
        let monthsTest = 0;

        while (balanceTest > 0 && monthsTest < 1000) {
          const interestTest = balanceTest * monthlyRateTest;
          const principalPaidTest = payment - interestTest;
          if (principalPaidTest <= 0) break;
          balanceTest -= principalPaidTest;
          monthsTest++;
        }

        if (balanceTest <= 0) {
          estimatedAPR = mid * 100; // convert to percent
          high = mid;
        } else {
          low = mid;
        }
      }

      currentAPR = estimatedAPR;
      setApr(currentAPR.toFixed(2));
      setAprEstimated(true);
    } else {
      setAprEstimated(false);
    }

    const monthlyRate = currentAPR / 100 / 12;

    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    if (!isNaN(target) && target > 0) {
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      let tempRemaining = principal;
      totalInterest = 0;
      for (let i = 0; i < target; i++) {
        const interest = tempRemaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = requiredPayment - interest;
        tempRemaining -= principalPaid;
      }
      months = target;
      remaining = tempRemaining;
    } else {
      // Check if payment covers interest of first month to avoid infinite loop
      const firstMonthInterest = remaining * monthlyRate;
      if (payment <= firstMonthInterest) {
        setErrorMessage('Payment is too low to ever pay off the balance.');
        setResultsVisible(false);
        return;
      }

      while (remaining > 0 && months < 1000) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) break;
        remaining -= principalPaid;
        months++;
      }
    }

    const totalPaid = principal + totalInterest;

    setResultData({
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      monthsToPayoff: months,
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
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
              placeholder="Leave empty to estimate"
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
              Calculate
            </button>
            <button type="button" className="reset-btn" onClick={resetAll} style={{ flex: 1 }}>
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}
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
              colors={['#e74c3c', '#4aa4e3']} // red and blue
            />

            <p
              className="chart-labels"
              style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}
            >
              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Interest Paid</span>
              <span style={{ color: '#4aa4e3', fontWeight: 'bold' }}>Principal Paid</span>
            </p>

            {aprEstimated && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#b00020',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                }}
              >
                * APR estimated from minimum payment
              </p>
            )}
          </div>
        )}

        {errorMessage && (
          <p
            style={{
              fontSize: '0.9rem',
              color: '#b00020',
              marginTop: '0.5rem',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
