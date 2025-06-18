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
    const raw = e.target.value.replace(/[^\d]/g, '');
    const formatted = Number(raw).toLocaleString();
    setLoanAmount(formatted);
  };

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12 || 0;
    const n = parseFloat(loanTerm) * 12;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || isNaN(r1)) {
      alert('Please fill in Loan Amount, Loan Term and Initial Rate.');
      return;
    }

    let balance = P;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPaid = 0;
    let payment = 0;
    let secondPayment = 0;
    let timeMonths = n;

    if (target) {
      const months = target * 12;
      const rate = r1 || r2;
      payment = rate
        ? (P * rate) / (1 - Math.pow(1 + rate, -months))
        : P / months;

      let tempBalance = P;
      for (let i = 0; i < months; i++) {
        const interest = tempBalance * rate;
        const principal = payment - interest;
        tempBalance -= principal;
        totalInterest += interest;
        totalPrincipal += principal;
      }

      setMonthlyPayment(payment.toFixed(2));
      setSecondaryPayment(null);
      setYearsRemaining(target.toFixed(2));
      setRemainingBalance(tempBalance > 0 ? tempBalance.toFixed(2) : '0.00');
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - tempBalance).toFixed(2));
      setSubmitted(true);
      return;
    }

    if (fixedN && r2) {
      const monthly1 = (P * r1) / (1 - Math.pow(1 + r1, -n)) + extra;

      for (let i = 0; i < fixedN; i++) {
        const interest = balance * r1;
        const principal = monthly1 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPrincipal += principal;
        totalPaid += monthly1;
      }

      const monthly2 = (balance * r2) / (1 - Math.pow(1 + r2, -(n - fixedN))) + extra;

      for (let i = 0; i < n - fixedN; i++) {
        const interest = balance * r2;
        const principal = monthly2 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPrincipal += principal;
        totalPaid += monthly2;
        if (balance <= 0) {
          timeMonths = fixedN + i + 1;
          balance = 0;
          break;
        }
      }

      setMonthlyPayment((monthly1 - extra).toFixed(2));
      setSecondaryPayment((monthly2 - extra).toFixed(2));
      setYearsRemaining((timeMonths / 12).toFixed(2));
      setRemainingBalance(balance.toFixed(2));
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - balance).toFixed(2));
      setSubmitted(true);
      return;
    }

    const monthly = (P * r1) / (1 - Math.pow(1 + r1, -n)) + extra;
    let tempBalance = P;

    for (let i = 0; i < n; i++) {
      const interest = tempBalance * r1;
      const principal = monthly - interest;
      tempBalance -= principal;
      totalInterest += interest;
      totalPrincipal += principal;
      if (tempBalance <= 0) {
        timeMonths = i + 1;
        break;
      }
    }

    setMonthlyPayment(monthly.toFixed(2));
    setSecondaryPayment(null);
    setYearsRemaining((timeMonths / 12).toFixed(2));
    setRemainingBalance(tempBalance > 0 ? tempBalance.toFixed(2) : '0.00');
    setInterestPaid(totalInterest.toFixed(2));
    setPrincipalPaid((P - tempBalance).toFixed(2));
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
              placeholder="e.g. 250,000 (Required)"
              value={loanAmount}
              onChange={handleLoanAmountChange}
              inputMode="decimal"
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          {[
            ['Loan Term (Years)', loanTerm, setLoanTerm, 'e.g. 25 (Required)'],
            ['Initial Rate (%)', initialRate, setInitialRate, 'e.g. 4.5 (Required)'],
            ['Fixed Term (Years)', fixedTerm, setFixedTerm, 'e.g. 3 (Where appropriate)'],
            ['Secondary Rate (%)', secondaryRate, setSecondaryRate, 'e.g. 6.5 (Where appropriate)'],
            ['Overpayment (£)', overpayment, setOverpayment, 'e.g. 100 (Optional)'],
            ['Target (Years)', targetYears, setTargetYears, 'e.g. 15 (Optional)']
          ].map(([label, value, setter, placeholder], i) => (
            <div className="input-row" key={i}>
              <label>{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
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
