import React, { useState } from 'react';
import PieChart from './PieChart'; // Make sure this uses blue principal color
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
    let annualRate = parseFloat(apr) / 100;
    const monthlyRate = annualRate / 12;
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    // Validation: require principal and either APR or payment
    if (!principal || (!annualRate && !payment)) {
      return;
    }

    // Estimate APR if missing and payment is provided
    if (!annualRate && payment) {
      setAprEstimated(true);
      let low = 0;
      let high = 100;
      let estAPR = 0;

      for (let i = 0; i < 50; i++) {
        let mid = (low + high) / 2;
        let midMonthly = mid / 12 / 100;
        let rem = principal;
        let mths = 0;

        while (rem > 0 && mths < 1000) {
          const interest = rem * midMonthly;
          const principalPaid = payment - interest;
          if (principalPaid <= 0) break;
          rem -= principalPaid;
          mths++;
        }

        if (mths >= 1000) {
          low = mid;
        } else {
          high = mid;
          estAPR = mid;
        }
      }
      annualRate = estAPR / 100;
      setApr(estAPR.toFixed(2));  // This will update the APR input field properly
    } else {
      setAprEstimated(false);
    }

    // Use updated monthly rate after APR estimation
    const updatedMonthlyRate = annualRate / 12;

    if (!isNaN(target)) {
      const requiredPayment = (principal * updatedMonthlyRate) / (1 - Math.pow(1 + updatedMonthlyRate, -target));
      payment = requiredPayment;
      months = target;
      for (let i = 0; i < months; i++) {
        const interest = remaining * updatedMonthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        remaining -= principalPaid;
      }
    } else {
      while (remaining > 0 && months < 1000) {
        const interest = remaining * updatedMonthlyRate;
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
              placeholder="e.g. 1,000.00"
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
              placeholder="e.g. 18.99"
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
              placeholder="e.g. 50.00"
            />
            <button type="button" className="clear-btn" onClick={() => setMonthlyPayment('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="target-months-input">Target Payoff (Months)</label>
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
              placeholder="Optional"
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
            />

            {aprEstimated && (
              <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem' }}>
                *APR estimated from minimum payment
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
