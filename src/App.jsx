import React, { useState } from 'react';
import PieChart from './PieChart';
import InfoPage from './InfoPage';
import './App.css';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [fixedTerm, setFixedTerm] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [secondaryPayment, setSecondaryPayment] = useState(null);
  const [yearsRemaining, setYearsRemaining] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [interestPaid, setInterestPaid] = useState(0);
  const [principalPaid, setPrincipalPaid] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const parseNumber = (value) =>
    parseFloat(value.replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;

  const formatNumber = (value) =>
    Number(value).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const n = parseFloat(loanTerm) * 12;
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12 || null;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || isNaN(r1)) {
      alert('Please fill in Loan Amount, Loan Term and Initial Rate.');
      return;
    }

    let payment, totalPaid = 0, totalInterest = 0, balance = P, fixedPayment, secPayment;

    const getPMT = (rate, periods, principal) =>
      rate ? (principal * rate) / (1 - Math.pow(1 + rate, -periods)) : principal / periods;

    // Target overrides standard payments
    const targetN = target ? target * 12 : n;

    if (target) {
      const targetPayment = getPMT(r1, targetN, P) + extra;
      for (let i = 0; i < targetN; i++) {
        const interest = balance * r1;
        const principal = targetPayment - interest;
        balance -= principal;
        totalPaid += targetPayment;
        totalInterest += interest;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }
      setMonthlyPayment((targetPayment).toFixed(2));
      setSecondaryPayment(null);
      setYearsRemaining((totalPaid / targetPayment / 12).toFixed(2));
      setRemainingBalance(balance.toFixed(2));
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - balance).toFixed(2));
      setSubmitted(true);
      return;
    }

    // FIXED period
    fixedPayment = getPMT(r1, n, P) + extra;
    for (let i = 0; i < fixedN; i++) {
      const interest = balance * r1;
      const principal = fixedPayment - interest;
      balance -= principal;
      totalPaid += fixedPayment;
      totalInterest += interest;
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    // SECONDARY period
    if (r2 && balance > 0) {
      const remainingMonths = n - fixedN;
      secPayment = getPMT(r2, remainingMonths, balance) + extra;
      for (let i = 0; i < remainingMonths; i++) {
        const interest = balance * r2;
        const principal = secPayment - interest;
        balance -= principal;
        totalPaid += secPayment;
        totalInterest += interest;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }
    }

    // SIMPLE: no fixed term / no secondary rate
    if (!fixedTerm || !secondaryRate) {
      fixedPayment = getPMT(r1, n, P) + extra;
      for (let i = 0; i < n; i++) {
        const interest = balance * r1;
        const principal = fixedPayment - interest;
        balance -= principal;
        totalPaid += fixedPayment;
        totalInterest += interest;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }
    }

    const finalMonthly = fixedPayment;
    const months = totalPaid / finalMonthly;
    const yearsLeft = months / 12;

    setMonthlyPayment(finalMonthly.toFixed(2));
    setSecondaryPayment(secPayment ? secPayment.toFixed(2) : null);
    setYearsRemaining(yearsLeft.toFixed(2));
    setRemainingBalance(balance.toFixed(2));
    setInterestPaid(totalInterest.toFixed(2));
    setPrincipalPaid((P - balance).toFixed(2));
    setSubmitted(true);
  };

  const handleReset = () => {
    setLoanAmount('');
    setLoanTerm('');
    setInitialRate('');
    setFixedTerm('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setSubmitted(false);
    setMonthlyPayment(null);
    setSecondaryPayment(null);
    setYearsRemaining(null);
    setRemainingBalance(null);
    setInterestPaid(0);
    setPrincipalPaid(0);
  };

  const handleFormat = (value) => {
    const parsed = parseNumber(value);
    return parsed ? formatNumber(parsed) : '';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(!showInfo)}>
          {showInfo ? '×' : 'ℹ️'}
        </button>
      </div>

      {showInfo ? (
        <InfoPage onBack={() => setShowInfo(false)} />
      ) : (
        <>
          <div className="input-row">
            <label>Loan Amount (£)</label>
            <input
              type="text"
              inputMode="decimal"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              onBlur={(e) => setLoanAmount(handleFormat(e.target.value))}
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input
              type="number"
              inputMode="decimal"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setLoanTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={initialRate}
              onChange={(e) => setInitialRate(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term (Years)</label>
            <input
              type="number"
              inputMode="decimal"
              value={fixedTerm}
              onChange={(e) => setFixedTerm(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setFixedTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={secondaryRate}
              onChange={(e) => setSecondaryRate(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£) (Optional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={overpayment}
              onChange={(e) => setOverpayment(e.target.value)}
              onBlur={(e) => setOverpayment(handleFormat(e.target.value))}
            />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target (Years) (Optional)</label>
            <input
              type="number"
              inputMode="decimal"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <button className="reset-btn" onClick={handleReset}>
              Reset All
            </button>
          </div>

          {submitted && (
            <div className="results visible">
              {monthlyPayment && (
                <p>
                  <strong>Initial Monthly Payment:</strong> £{formatNumber(monthlyPayment)}
                </p>
              )}
              {secondaryPayment && (
                <p>
                  <strong>Secondary Monthly Payment:</strong> £{formatNumber(secondaryPayment)}
                </p>
              )}
              {yearsRemaining && (
                <p>
                  <strong>Time to Complete Mortgage:</strong> {yearsRemaining} years
                </p>
              )}
              {remainingBalance && (
                <p>
                  <strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}
                </p>
              )}
              {(interestPaid > 0 || principalPaid > 0) && (
                <PieChart
                  interest={parseFloat(interestPaid)}
                  principal={parseFloat(principalPaid)}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
