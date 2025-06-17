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

    let payment1, payment2 = 0;
    let balance = P;
    let totalInterest = 0;
    let totalPaid = 0;
    let monthsUsed = 0;

    if (target) {
      const targetMonths = target * 12;
      const payment = r1
        ? (balance * r1) / (1 - Math.pow(1 + r1, -targetMonths))
        : balance / targetMonths;

      for (let i = 0; i < targetMonths; i++) {
        const interest = balance * r1;
        const principal = payment - interest + extra;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment + extra;
        monthsUsed++;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }

      setMonthlyPayment(payment.toFixed(2));
      setSecondaryPayment(null);
    } else {
      payment1 = r1
        ? (balance * r1) / (1 - Math.pow(1 + r1, -n))
        : balance / n;

      for (let i = 0; i < fixedN; i++) {
        const interest = balance * r1;
        const principal = payment1 - interest + extra;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment1 + extra;
        monthsUsed++;
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }

      if (balance > 0 && r2) {
        const remainingMonths = n - fixedN;
        payment2 = (balance * r2) / (1 - Math.pow(1 + r2, -remainingMonths));

        for (let i = 0; i < remainingMonths; i++) {
          const interest = balance * r2;
          const principal = payment2 - interest + extra;
          balance -= principal;
          totalInterest += interest;
          totalPaid += payment2 + extra;
          monthsUsed++;
          if (balance <= 0) {
            balance = 0;
            break;
          }
        }

        setSecondaryPayment(payment2.toFixed(2));
      } else {
        setSecondaryPayment(null);
      }

      setMonthlyPayment(payment1.toFixed(2));
    }

    const yearsLeft = monthsUsed / 12;

    setYearsRemaining(Math.max(0, yearsLeft.toFixed(1)));
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

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button
          className="share-btn"
          onClick={() => setShowInfo(!showInfo)}
          title="Info / Disclaimer"
        >
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
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d.]/g, '');
                const formatted = new Intl.NumberFormat('en-GB').format(raw);
                setLoanAmount(formatted);
              }}
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
                  <strong>Remaining Balance:</strong> £{formatNumber(remainingBalance)}
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
