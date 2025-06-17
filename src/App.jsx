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
  const [totalOutlay, setTotalOutlay] = useState(null);
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

    const targetTerm = target ? target * 12 : n;
    const payment1 = PMT(r1, targetTerm, P);
    const fullMonthly = payment1 + extra;
    const paymentUsed = fullMonthly;

    // Time to Complete
    let actualMonths = 0;
    let tempBalance = P;
    while (tempBalance > 0 && actualMonths < 1000) {
      const interest = tempBalance * r1;
      const principal = paymentUsed - interest;
      tempBalance -= principal;
      actualMonths++;
      if (actualMonths > targetTerm) break;
    }

    const timeComplete =
      paymentUsed <= 0 ? 'N/A' : Math.round((actualMonths / 12) * 100) / 100;

    // Remaining Balance after fixed term
    const compoundBalance = P * Math.pow(1 + r1, fixedN);
    const paidOff =
      fullMonthly *
      ((Math.pow(1 + r1, fixedN) - 1) / r1 || 0); // prevent div by 0
    const balance = Math.max(0, compoundBalance - paidOff);

    // Secondary payment
    let payment2 = null;
    if (fixedN > 0 && r2 && n - fixedN > 0) {
      payment2 = PMT(r2, n - fixedN, balance);
    }

    setMonthlyPayment(payment1.toFixed(2));
    setTotalOutlay(extra > 0 ? (payment1 + extra).toFixed(2) : null);
    setSecondaryPayment(payment2 ? payment2.toFixed(2) : null);
    setRemainingBalance(balance.toFixed(2));
    setTimeToComplete(timeComplete);
    setInterestPaid(balance > 0 ? (P - balance).toFixed(2) : P.toFixed(2));
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
    setTotalOutlay(null);
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
                  e.target.value.replace(/[^\d.,]/g, '')
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
                setOverpayment(e.target.value.replace(/[^\d.,]/g, ''))
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
                <p><strong>Initial Monthly Payment:</strong> £{formatNumber(monthlyPayment)}</p>
              )}
              {totalOutlay && (
                <p><strong>Total Monthly Outlay:</strong> £{formatNumber(totalOutlay)}</p>
              )}
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
