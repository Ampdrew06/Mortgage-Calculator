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
  const [aprEstimated, setAprEstimated] = useState(false); // track if APR was estimated

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setAprEstimated(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);

    if (!principal || !payment) {
      alert('Please enter valid Amount Outstanding and Minimum Monthly Payment.');
      return;
    }

    let currentAPR = parseFloat(apr);

    // Estimate APR if empty or invalid
    if (!currentAPR || currentAPR <= 0) {
      // Binary search between 0% and 300% APR (0 to 3 decimal)
      let low = 0;
      let high = 3;
      let mid;
      let estimatedAPR = 0;

      for (let i = 0; i < 20; i++) {
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
          estimatedAPR = mid * 100; // convert to %
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
      // Calculate required payment for target months (override entered payment)
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      // Use requiredPayment for calculation
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
      payment = requiredPayment;
    } else {
      // Normal payoff calc using provided or estimated APR and payment
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
      </div>
    </>
  );
};

export default CreditCardCalculator;
