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

  const parseNumber = (val) =>
    parseFloat(val.replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;

  const formatNumber = (value) =>
    Number(value).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const n = parseFloat(loanTerm) * 12;
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || isNaN(r1)) {
      alert('Please fill in Loan Amount, Loan Term and Initial Rate.');
      return;
    }

    let payment, balance = P, totalPaid = 0, totalInterest = 0, monthsCompleted = 0;

    // Target term takes priority
    if (target) {
      const totalMonths = target * 12;
      const paymentWithTarget = (P * r1) / (1 - Math.pow(1 + r1, -totalMonths)) + extra;
      payment = paymentWithTarget;
    } else {
      const paymentStandard = (P * r1) / (1 - Math.pow(1 + r1, -n)) + extra;
      payment = paymentStandard;
    }

    // Simple: no fixed or secondary
    if (!fixedTerm || !secondaryRate) {
      for (let i = 0; i < n; i++) {
        const interest = balance * r1;
        const principal = payment - interest;
        balance -= principal;
        totalPaid += payment;
        totalInterest += interest;
        monthsCompleted++;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }

      setMonthlyPayment((payment - extra).toFixed(2));
      setSecondaryPayment(null);
      setYearsRemaining((monthsCompleted / 12).toFixed(2));
      setRemainingBalance(balance.toFixed(2));
    } else {
      // Fixed rate period
      const fixedPayment = (P * r1) / (1 - Math.pow(1 + r1, -n)) + extra;
      for (let i = 0; i < fixedN; i++) {
        const interest = balance * r1;
        const principal = fixedPayment - interest;
        balance -= principal;
        totalPaid += fixedPayment;
        totalInterest += interest;
        monthsCompleted++;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }

      // Secondary rate period
      if (balance > 0) {
        const remainingN = n - fixedN;
        let secondaryPmt = (balance * r2) / (1 - Math.pow(1 + r2, -remainingN)) + extra;

        for (let i = 0; i < remainingN; i++) {
          const interest = balance * r2;
          const principal = secondaryPmt - interest;
          balance -= principal;
          totalPaid += secondaryPmt;
          totalInterest += interest;
          monthsCompleted++;
          if (balance <= 0) {
            balance = 0;
            break;
          }
        }

        setSecondaryPayment((secondaryPmt - extra).toFixed(2));
      } else {
        setSecondaryPayment(null);
      }

      setMonthlyPayment((fixedPayment - extra).toFixed(2));
      setRemainingBalance(balance.toFixed(2));
      setYearsRemaining((monthsCompleted / 12).toFixed(2));
    }

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

  const handleCurrencyChange = (value, setter) => {
    let clean = value.replace(/[^\d]/g, '');
    if (!clean) return setter('');
    const numeric = parseFloat(clean) / 100;
    setter(numeric.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
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
              onChange={(e) => handleCurrencyChange(e.target.value, setLoanAmount)}
              inputMode="numeric"
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          {[
            ['Loan Term (Years)', loanTerm, setLoanTerm],
            ['Initial Rate (%)', initialRate, setInitialRate],
            ['Fixed Term (Years)', fixedTerm, setFixedTerm],
            ['Secondary Rate (%)', secondaryRate, setSecondaryRate],
            ['Overpayment (£) (Optional)', overpayment, setOverpayment],
            ['Target (Years) (Optional)', targetYears, setTargetYears]
          ].map(([label, value, setter], i) => (
            <div className="input-row" key={i}>
              <label>{label}</label>
              <input
                type="text"
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
