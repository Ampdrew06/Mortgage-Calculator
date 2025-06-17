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
  const [timeToComplete, setTimeToComplete] = useState(null);
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

  const PMT = (rate, nper, pv) =>
    rate ? (pv * rate) / (1 - Math.pow(1 + rate, -nper)) : pv / nper;

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const n = parseFloat(loanTerm) * 12;
    const r1 = parseFloat(initialRate) / 100 / 12;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || isNaN(r1)) {
      alert('Please fill in Loan Amount, Loan Term and Initial Rate.');
      return;
    }

    let totalInterest = 0;
    let totalPrincipal = 0;
    let balance = P;
    let monthsElapsed = 0;
    let monthly = 0;
    let phaseTwoMonthly = null;

    if (fixedN > 0 && r2 > 0) {
      const baseMonthly1 = PMT(r1, fixedN, P);
      const fullMonthly1 = baseMonthly1 + extra;
      monthly = fullMonthly1;

      for (let i = 0; i < fixedN && balance > 0; i++) {
        const interest = balance * r1;
        const principal = fullMonthly1 - interest;
        totalInterest += interest;
        totalPrincipal += principal;
        balance -= principal;
        monthsElapsed++;
      }

      if (balance > 0) {
        const remainingMonths = n - fixedN;
        const baseMonthly2 = PMT(r2, remainingMonths, balance);
        const fullMonthly2 = baseMonthly2 + extra;
        phaseTwoMonthly = baseMonthly2;

        for (let i = 0; i < remainingMonths && balance > 0; i++) {
          const interest = balance * r2;
          const principal = fullMonthly2 - interest;
          totalInterest += interest;
          totalPrincipal += principal;
          balance -= principal;
          monthsElapsed++;
        }
      }
    } else {
      const fullTerm = target ? target * 12 : n;
      const baseMonthly = PMT(r1, fullTerm, P);
      const fullMonthly = baseMonthly + extra;
      monthly = fullMonthly;

      for (let i = 0; i < fullTerm && balance > 0; i++) {
        const interest = balance * r1;
        const principal = fullMonthly - interest;
        totalInterest += interest;
        totalPrincipal += principal;
        balance -= principal;
        monthsElapsed++;
      }
    }

    setMonthlyPayment(monthly.toFixed(2));
    setSecondaryPayment(phaseTwoMonthly ? phaseTwoMonthly.toFixed(2) : null);
    setRemainingBalance(balance > 0 ? balance.toFixed(2) : '0.00');
    setTimeToComplete((monthsElapsed / 12).toFixed(2));
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
    setRemainingBalance(null);
    setTimeToComplete(null);
    setInterestPaid(0);
    setPrincipalPaid(0);
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
              value={loanAmount}
              onChange={(e) =>
                setLoanAmount(
                  e.target.value.replace(/[^\d.,]/g, '').replace(/,/g, '')
                )
              }
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setLoanTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Rate (%)</label>
            <input
              type="number"
              value={initialRate}
              onChange={(e) => setInitialRate(e.target.value)}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term (Years)</label>
            <input
              type="number"
              value={fixedTerm}
              onChange={(e) => setFixedTerm(e.target.value)}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setFixedTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input
              type="number"
              value={secondaryRate}
              onChange={(e) => setSecondaryRate(e.target.value)}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£) (Optional)</label>
            <input
              type="text"
              value={overpayment}
              onChange={(e) =>
                setOverpayment(
                  e.target.value.replace(/[^\d.,]/g, '').replace(/,/g, '')
                )
              }
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target (Years) (Optional)</label>
            <input
              type="number"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="reset-btn" onClick={handleReset}>Reset All</button>
          </div>

          {submitted && (
            <div className="results visible">
              <p><strong>Monthly Payment:</strong> £{formatNumber(monthlyPayment)}</p>
              {secondaryPayment && (
                <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondaryPayment)}</p>
              )}
              {timeToComplete && (
                <p><strong>Time to Complete Mortgage:</strong> {timeToComplete} years</p>
              )}
              {remainingBalance && (
                <p><strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}</p>
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
