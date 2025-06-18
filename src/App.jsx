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
    const r2 = parseFloat(secondaryRate) / 100 / 12 || 0;
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
    let timeMonths = n;
    let monthly1 = 0;
    let monthly2 = 0;
    let payment = 0;

    if (target) {
      const months = target * 12;
      const rate = r1;
      payment = rate ? (P * rate) / (1 - Math.pow(1 + rate, -months)) : P / months;
      let tempBalance = P;
      let totalInterestLocal = 0;
      let totalPrincipalLocal = 0;

      for (let i = 0; i < months; i++) {
        const interest = tempBalance * rate;
        const principal = payment - interest;
        tempBalance -= principal;
        totalInterestLocal += interest;
        totalPrincipalLocal += principal;
        if (tempBalance <= 0) {
          timeMonths = i + 1;
          tempBalance = 0;
          break;
        }
      }

      setMonthlyPayment(payment.toFixed(2));
      setSecondaryPayment(null);
      setYearsRemaining((timeMonths / 12).toFixed(2));
      setRemainingBalance('0.00');
      setInterestPaid(totalInterestLocal.toFixed(2));
      setPrincipalPaid((P - tempBalance).toFixed(2));
      setSubmitted(true);
      return;
    }

    // Full version with fixed and secondary rate
    if (fixedN && r2) {
      const basePayment = r1 ? (P * r1) / (1 - Math.pow(1 + r1, -n)) : P / n;
      monthly1 = basePayment + extra;

      for (let i = 0; i < fixedN; i++) {
        const interest = balance * r1;
        const principal = monthly1 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPrincipal += principal;
        if (balance <= 0) {
          balance = 0;
          timeMonths = i + 1;
          break;
        }
      }

      const balanceAtFixedTerm = balance;

      const baseSecondary = r2
        ? (balance * r2) / (1 - Math.pow(1 + r2, -(n - fixedN)))
        : balance / (n - fixedN);
      monthly2 = baseSecondary + extra;

      for (let i = 0; i < n - fixedN; i++) {
        const interest = balance * r2;
        const principal = monthly2 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPrincipal += principal;
        if (balance <= 0) {
          balance = 0;
          timeMonths = fixedN + i + 1;
          break;
        }
      }

      setMonthlyPayment(monthly1.toFixed(2));
      setSecondaryPayment(monthly2.toFixed(2));
      setYearsRemaining((timeMonths / 12).toFixed(2));
      setRemainingBalance(balanceAtFixedTerm.toFixed(2));
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - balance).toFixed(2));
      setSubmitted(true);
      return;
    }

    // Simple mortgage
    const months = n;
    const basePaymentSimple = r1 ? (P * r1) / (1 - Math.pow(1 + r1, -months)) : P / months;
    const monthlySimple = basePaymentSimple + extra;
    let tempBalance = P;

    for (let i = 0; i < months; i++) {
      const interest = tempBalance * r1;
      const principal = monthlySimple - interest;
      tempBalance -= principal;
      totalInterest += interest;
      totalPrincipal += principal;
      if (tempBalance <= 0) {
        timeMonths = i + 1;
        tempBalance = 0;
        break;
      }
    }

    setMonthlyPayment(monthlySimple.toFixed(2));
    setSecondaryPayment(null);
    setYearsRemaining((timeMonths / 12).toFixed(2));
    setRemainingBalance(tempBalance.toFixed(2));
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

  const handleLoanAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const formatted = Number(raw).toLocaleString();
    setLoanAmount(formatted);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(!showInfo)}>{showInfo ? '×' : 'i'}</button>
      </div>

      {showInfo ? (
        <InfoPage onBack={() => setShowInfo(false)} />
      ) : (
        <>
          <div className="input-row">
            <label>Loan Amount (£)</label>
            <input type="text" inputMode="decimal" placeholder="e.g. 250,000 (Required)" value={loanAmount} onChange={handleLoanAmountChange} />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input type="number" placeholder="e.g. 25 (Required)" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setLoanTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Rate (%)</label>
            <input type="number" placeholder="e.g. 4.5 (Required)" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term (Years)</label>
            <input type="number" placeholder="e.g. 3 (Where appropriate)" value={fixedTerm} onChange={(e) => setFixedTerm(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setFixedTerm('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input type="number" placeholder="e.g. 6.5 (Where appropriate)" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£)</label>
            <input type="number" placeholder="e.g. 100 (Optional)" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target (Years)</label>
            <input type="number" placeholder="e.g. 15 (Optional)" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} inputMode="decimal" />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="reset-btn" onClick={handleReset}>Reset All</button>
          </div>

          {submitted && (
            <div className="results visible">
              {monthlyPayment && <p><strong>Monthly Payment:</strong> £{formatNumber(monthlyPayment)}</p>}
              {secondaryPayment && <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondaryPayment)}</p>}
              {yearsRemaining && <p><strong>Time to Complete Mortgage:</strong> {yearsRemaining} years</p>}
              {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}</p>}
              {(interestPaid > 0 || principalPaid > 0) && (
                <PieChart interest={parseFloat(interestPaid)} principal={parseFloat(principalPaid)} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
