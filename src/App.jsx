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

  const handleLoanAmountChange = (e) => {
    const raw = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '');
    if (!isNaN(raw)) {
      const parts = raw.split('.');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const decimal = parts[1] ? '.' + parts[1].slice(0, 2) : '';
      setLoanAmount(intPart + decimal);
    }
  };

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseFloat(loanTerm) * 12;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || isNaN(r1)) {
      alert('Please fill in Loan Amount, Loan Term and Initial Rate.');
      return;
    }

    const baseRate = r1 || r2;
    let fixedMonthly = baseRate
      ? (P * baseRate) / (1 - Math.pow(1 + baseRate, -(target ? target * 12 : n)))
      : P / (target ? target * 12 : n);

    let totalPaid = 0;
    let totalInterest = 0;
    let balance = P;
    let monthsElapsed = 0;

    let payment1 = r1 ? (P * r1) / (1 - Math.pow(1 + r1, -n)) : P / n;
    if (extra) payment1 += extra;

    for (let i = 0; i < fixedN; i++) {
      const interest = balance * r1;
      const principal = payment1 - interest;
      balance -= principal;
      totalPaid += payment1;
      totalInterest += interest;
      monthsElapsed++;
      if (balance <= 0) break;
    }

    let payment2 = 0;
    if (balance > 0 && r2) {
      const remainingMonths = n - monthsElapsed;
      payment2 = (balance * r2) / (1 - Math.pow(1 + r2, -remainingMonths));
      if (extra) payment2 += extra;

      for (let i = 0; i < remainingMonths; i++) {
        const interest = balance * r2;
        const principal = payment2 - interest;
        balance -= principal;
        totalPaid += payment2;
        totalInterest += interest;
        monthsElapsed++;
        if (balance <= 0) break;
      }
    }

    if (target) {
      const months = target * 12;
      let tempBalance = P;
      let rate = r1 || r2;
      let payment = (tempBalance * rate) / (1 - Math.pow(1 + rate, -months));
      if (extra) payment += extra;

      for (let i = 0; i < months; i++) {
        const interest = tempBalance * rate;
        const principal = payment - interest;
        tempBalance -= principal;
        if (tempBalance <= 0) {
          monthsElapsed = i + 1;
          balance = 0;
          break;
        }
      }
      fixedMonthly = payment;
    }

    setMonthlyPayment(fixedMonthly.toFixed(2));
    setSecondaryPayment(payment2 ? payment2.toFixed(2) : null);
    setYearsRemaining((monthsElapsed / 12).toFixed(2));
    setRemainingBalance(balance > 0 ? balance.toFixed(2) : '0.00');
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

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(!showInfo)}>
          {showInfo ? '×' : 'i'}
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
              onChange={handleLoanAmountChange}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>
          {[
            ['Loan Term (Years)', loanTerm, setLoanTerm],
            ['Initial Rate (%)', initialRate, setInitialRate],
            ['Fixed Term (Years)', fixedTerm, setFixedTerm],
            ['Secondary Rate (%)', secondaryRate, setSecondaryRate],
            ['Overpayment (£) (Optional)', overpayment, setOverpayment],
            ['Target (Years) (Optional)', targetYears, setTargetYears],
          ].map(([label, value, setter], i) => (
            <div className="input-row" key={i}>
              <label>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value.replace(/[^\d.]/g, ''))}
                inputMode="decimal"
              />
              <button className="clear-btn" onClick={() => setter('')}>Clear</button>
            </div>
          ))}

          <div className="action-row">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="reset-btn" onClick={handleReset}>Reset All</button>
          </div>

          {submitted && (
            <div className="results visible">
              {monthlyPayment && (
                <p><strong>Monthly Payment:</strong> £{formatNumber(monthlyPayment)}</p>
              )}
              {secondaryPayment && (
                <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondaryPayment)}</p>
              )}
              {yearsRemaining && (
                <p><strong>Time to Complete Mortgage:</strong> {yearsRemaining} years</p>
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
