import React, { useState } from 'react';
import PieChart from './PieChart'; // your shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [isAprEstimated, setIsAprEstimated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
    setIsAprEstimated(false);
    setErrorMsg('');
    setResultData({
      totalInterest: 0,
      totalPaid: 0,
      monthsToPayoff: 0,
    });
  };

  // Function to estimate APR if missing
  const estimateAprFromPayment = (principal, payment) => {
    // We'll do a binary search to find the APR that matches the payment roughly
    // between 0% and 300% APR annually
    let low = 0;
    let high = 3.0; // 300% APR as decimal (3.0)
    let mid = 0;
    let monthlyPaymentEstimate = 0;
    const tolerance = 0.01; // £ tolerance

    for (let i = 0; i < 30; i++) { // limit iterations
      mid = (low + high) / 2;
      const monthlyRate = mid / 12;

      // Use amortization formula to calculate payment for this rate and 1000 months (long time)
      // but since we want to match payment to interest, let's try 1000 months as upper limit
      const n = 1000;

      monthlyPaymentEstimate =
        principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);

      if (monthlyPaymentEstimate > payment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return mid * 100; // convert decimal to %
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAprEstimated(false);

    const principal = parseFloat(balance.replace(/,/g, ''));
    let annualRate = apr ? parseFloat(apr) / 100 : 0;
    const monthlyPaymentNum = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    if (!principal || !monthlyPaymentNum) {
      setErrorMsg('Please enter Amount Outstanding and Minimum Monthly Payment.');
      setResultsVisible(false);
      return;
    }

    // If APR missing or zero, estimate it based on payment and balance
    if ((!apr || apr.trim() === '') && principal && monthlyPaymentNum) {
      const estimatedApr = estimateAprFromPayment(principal, monthlyPaymentNum);
      annualRate = estimatedApr / 100;
      setApr(estimatedApr.toFixed(2));
      setIsAprEstimated(true);
    } else if (apr && apr.trim() !== '') {
      annualRate = parseFloat(apr) / 100;
    } else {
      // no APR and no way to estimate
      setErrorMsg('Please enter a valid APR or leave blank to estimate.');
      setResultsVisible(false);
      return;
    }

    const monthlyRate = annualRate / 12;

    // Check if payment covers interest; if not, show error
    const firstMonthInterest = remaining * monthlyRate;
    if (monthlyPaymentNum <= firstMonthInterest) {
      setErrorMsg('The Payment is too low to ever pay off the balance.');
      setResultsVisible(false);
      return;
    }

    let payment = monthlyPaymentNum;

    if (!isNaN(target)) {
      // If target months given, calculate interest and principal over that period
      months = target;
      for (let i = 0; i < months; i++) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        remaining -= principalPaid;
        if (remaining <= 0) {
          remaining = 0;
          months = i + 1; // actual months to payoff
          break;
        }
      }
    } else {
      // No target - calculate months to payoff with current payment
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
            />
            {isAprEstimated && (
              <small style={{ color: 'red', display: 'block', marginTop: '0.2rem' }}>
                *APR estimated from minimum payment
              </small>
            )}
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
            />

            {errorMsg && (
              <p style={{ color: 'red', marginTop: '1rem' }}>
                {errorMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
