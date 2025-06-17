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

  const PMT = (rate, nper, pv) => {
    return rate
      ? (pv * rate) / (1 - Math.pow(1 + rate, -nper))
      : pv / nper;
  };

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const r1 = parseFloat(initialRate) / 100 / 12 || 0;
    const r2 = parseFloat(secondaryRate) / 100 / 12 || 0;
    const n = parseFloat(loanTerm) * 12 || 0;
    const fixedN = parseFloat(fixedTerm) * 12 || 0;
    const extra = parseNumber(overpayment);
    const target = parseFloat(targetYears) || null;

    if (!P || !loanTerm || (!r1 && !r2)) {
      alert('Please fill in Loan Amount, Loan Term and at least one Interest Rate.');
      return;
    }

    let monthsElapsed = 0;
    let balance = P;
    let totalInterest = 0;
    let totalPaid = 0;
    let payment1 = 0;
    let payment2 = 0;

    // If target is set, calculate new payment to meet that
    if (target) {
      const months = target * 12;
      const rate = r1 || r2;
      const payment = PMT(rate, months, P) + extra;
      for (let i = 0; i < months && balance > 0; i++) {
        const interest = balance * rate;
        const principal = payment - interest;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment;
        monthsElapsed++;
      }
      setMonthlyPayment((payment - extra).toFixed(2));
      setSecondaryPayment(null);
      setRemainingBalance(balance.toFixed(2));
      setYearsRemaining((monthsElapsed / 12).toFixed(2));
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - balance).toFixed(2));
      setSubmitted(true);
      return;
    }

    // Fixed period phase
    if (fixedN > 0 && r1 > 0) {
      payment1 = PMT(r1, n, P) + extra;
      for (let i = 0; i < fixedN && balance > 0; i++) {
        const interest = balance * r1;
        const principal = payment1 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment1;
        monthsElapsed++;
      }
    } else if (r1 > 0) {
      // Single rate scenario
      payment1 = PMT(r1, n, P) + extra;
      for (let i = 0; i < n && balance > 0; i++) {
        const interest = balance * r1;
        const principal = payment1 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment1;
        monthsElapsed++;
      }
      setMonthlyPayment((payment1 - extra).toFixed(2));
      setSecondaryPayment(null);
      setRemainingBalance(balance.toFixed(2));
      setYearsRemaining((monthsElapsed / 12).toFixed(2));
      setInterestPaid(totalInterest.toFixed(2));
      setPrincipalPaid((P - balance).toFixed(2));
      setSubmitted(true);
      return;
    }

    // Secondary rate phase
    if (balance > 0 && r2 > 0) {
      const remainingMonths = n - fixedN;
      payment2 = PMT(r2, remainingMonths, balance) + extra;
      for (let i = 0; i < remainingMonths && balance > 0; i++) {
        const interest = balance * r2;
        const principal = payment2 - interest;
        balance -= principal;
        totalInterest += interest;
        totalPaid += payment2;
        monthsElapsed++;
      }
    }

    setMonthlyPayment((payment1 - extra).toFixed(2));
    setSecondaryPayment(payment2 ? (payment2 - extra).toFixed(2) : null);
    setRemainingBalance(balance.toFixed(2));
    setYearsRemaining((monthsElapsed / 12).toFixed(2));
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
          {[
            {
              label: 'Loan Amount (£)',
              value: loanAmount,
              onChange: setLoanAmount,
            },
            {
              label: 'Loan Term (Years)',
              value: loanTerm,
              onChange: setLoanTerm,
            },
            {
              label: 'Initial Rate (%)',
              value: initialRate,
              onChange: setInitialRate,
            },
            {
              label: 'Fixed Term (Years)',
              value: fixedTerm,
              onChange: setFixedTerm,
            },
            {
              label: 'Secondary Rate (%)',
              value: secondaryRate,
              onChange: setSecondaryRate,
            },
            {
              label: 'Overpayment (£) (Optional)',
              value: overpayment,
              onChange: setOverpayment,
            },
            {
              label: 'Target (Years) (Optional)',
              value: targetYears,
              onChange: setTargetYears,
            },
          ].map(({ label, value, onChange }, index) => (
            <div className="input-row" key={index}>
              <label>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => {
                  if (label.includes('Amount') || label.includes('Overpayment')) {
                    const parsed = parseNumber(value);
                    onChange(formatNumber(parsed));
                  }
                }}
                inputMode="decimal"
              />
              <button className="clear-btn" onClick={() => onChange('')}>Clear</button>
            </div>
          ))}

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
                  <strong>Initial Monthly Payment:</strong> £
                  {formatNumber(monthlyPayment)}
                </p>
              )}
              {secondaryPayment && (
                <p>
                  <strong>Secondary Monthly Payment:</strong> £
                  {formatNumber(secondaryPayment)}
                </p>
              )}
              {yearsRemaining && (
                <p>
                  <strong>Time to Complete Mortgage:</strong> {yearsRemaining} years
                </p>
              )}
              {remainingBalance && (
                <p>
                  <strong>Remaining Balance After Fixed Term:</strong> £
                  {formatNumber(remainingBalance)}
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
