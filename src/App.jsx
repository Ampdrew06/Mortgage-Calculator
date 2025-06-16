import React, { useState } from 'react';
import './App.css';
import PieChart from './PieChart';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('');
  const [fixedTermYears, setFixedTermYears] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');

  const [initialPayment, setInitialPayment] = useState('');
  const [secondPayment, setSecondPayment] = useState('');
  const [yearsRemaining, setYearsRemaining] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [interestPaid, setInterestPaid] = useState(0);
  const [principalPaid, setPrincipalPaid] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const basePMT = (pv, rate, nper) => (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const formatNumber = (value) => {
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const resetAll = () => {
    setLoanAmount('');
    setInitialRate('');
    setLoanTermYears('');
    setFixedTermYears('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setInitialPayment('');
    setSecondPayment('');
    setYearsRemaining('');
    setRemainingBalance('');
    setInterestPaid(0);
    setPrincipalPaid(0);
    setSubmitted(false);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const calculate = () => {
    setSubmitted(true);
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = fixedTermYears ? parseInt(fixedTermYears) * 12 : 0;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) return;

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    let interest = 0;
    let principal = 0;

    for (let i = 0; i < months; i++) {
      const monthlyInterest = P * r1;
      const monthlyPrincipal = initial - monthlyInterest;
      interest += monthlyInterest;
      principal += monthlyPrincipal;
      P -= monthlyPrincipal;
    }

    setInterestPaid(interest);
    setPrincipalPaid(principal);

    if (n - t > 0 && r2) {
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = initial * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(Math.abs(second).toFixed(2));
      setRemainingBalance(Math.abs(balance).toFixed(2));
    } else {
      setSecondPayment('');
      setRemainingBalance('');
    }

    let result;
    if (g && op) {
      const termPmt = basePMT(P, r1, g) + op;
      const nper = Math.log(1 + (P * r1) / -termPmt) / Math.log(1 + r1);
      result = nper < 0 ? 'N/A' : (nper / 12).toFixed(2);
    } else if (g) {
      result = (g / 12).toFixed(2);
    } else if (op) {
      const termPmt = basePMT(P, r1, n) + op;
      const nper = Math.log(1 + (P * r1) / -termPmt) / Math.log(1 + r1);
      result = (nper / 12).toFixed(2);
    } else {
      result = (n / 12).toFixed(2);
    }
    setYearsRemaining(result);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={toggleInfo} title="App Info">ℹ️</button>
      </div>

      {!showInfo && (
        <>
          <div className="input-row">
            <label>Loan Amount (£)</label>
            <input
              type="text"
              inputMode="numeric"
              value={loanAmount}
              onChange={(e) => {
                let raw = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '');
                if (!isNaN(raw) && raw !== '') {
                  const parts = raw.split('.');
                  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  setLoanAmount(parts.join('.'));
                } else {
                  setLoanAmount('');
                }
              }}
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input type="number" inputMode="numeric" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setLoanTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Rate (%)</label>
            <input type="number" inputMode="decimal" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term (Years)</label>
            <input type="number" inputMode="numeric" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setFixedTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input type="number" inputMode="decimal" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£)</label>
            <input type="text" inputMode="numeric" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target Years</label>
            <input type="number" inputMode="numeric" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={calculate}>Submit</button>
            <button className="reset-btn" onClick={resetAll}>Reset All</button>
          </div>

          {submitted && (
            <div className="results">
              {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{formatNumber(initialPayment)}</p>}
              {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondPayment)}</p>}
              {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
              {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}</p>}
              <PieChart interest={interestPaid} principal={principalPaid} />
            </div>
          )}
        </>
      )}

      {showInfo && (
        <div className="info-section">
          <h2>How to Use This App</h2>
          <ul>
            <li><strong>Loan Amount (£)</strong> – The total amount borrowed.</li>
            <li><strong>Loan Term</strong> – Duration of the mortgage in years.</li>
            <li><strong>Initial Rate (%)</strong> – Starting interest rate (usually fixed for a period).</li>
            <li><strong>Fixed Term (Years)</strong> – How long the initial rate lasts.</li>
            <li><strong>Secondary Rate (%)</strong> – The rate after the fixed period ends.</li>
            <li><strong>Overpayment (£)</strong> – Extra amount you want to pay monthly (optional).</li>
            <li><strong>Target Years</strong> – Desired time to repay mortgage (optional).</li>
          </ul>
          <h2>Disclaimer</h2>
          <p>This tool is for illustrative purposes only and should not be considered financial advice. Please consult a professional for accurate mortgage planning.</p>
        </div>
      )}
    </div>
  );
}

export default App;
