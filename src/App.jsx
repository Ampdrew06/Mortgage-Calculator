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
  const [submitted, setSubmitted] = useState(false);
  const [interestPaid, setInterestPaid] = useState(null);
  const [principalPaid, setPrincipalPaid] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

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
    setInterestPaid(null);
    setPrincipalPaid(null);
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12 || 0;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) {
      return;
    }

    const months = g || n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    let balance = P;
    let paidPrincipal = 0;
    let paidInterest = 0;

    for (let i = 0; i < months; i++) {
      const interest = balance * r1;
      const principal = (pmt + op) - interest;
      paidInterest += interest;
      paidPrincipal += principal;
      balance -= principal;
      if (balance <= 0) break;
    }

    setInterestPaid(Math.max(0, paidInterest.toFixed(2)));
    setPrincipalPaid(Math.max(0, paidPrincipal.toFixed(2)));

    if (n - t > 0) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(Math.abs(second).toFixed(2));
    } else {
      setSecondPayment('');
    }

    if (P === 0) {
      setYearsRemaining('');
    } else {
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
    }

    if (P === 0 || n - t <= 0) {
      setRemainingBalance('');
    } else {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      balance = futureValue - paid;
      setRemainingBalance(Math.abs(balance).toFixed(2));
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="info-btn" title="Info" onClick={() => setShowInfo(!showInfo)}>ℹ️</button>
      </div>

      {showInfo ? (
        <div className="info-section">
          <h2>Input Guide</h2>
          <ul>
            <li><strong>Loan Amount (£):</strong> Total mortgage amount.</li>
            <li><strong>Loan Term:</strong> Full duration in years.</li>
            <li><strong>Initial Rate (%):</strong> Introductory interest rate.</li>
            <li><strong>Fixed Term:</strong> Years the initial rate applies.</li>
            <li><strong>Secondary Rate:</strong> Follows fixed term.</li>
            <li><strong>Overpayment:</strong> Optional monthly extra.</li>
            <li><strong>Target Years:</strong> Optional goal to repay earlier.</li>
          </ul>
          <h2>Results Explained</h2>
          <p>
            <strong>Initial Payment:</strong> Monthly payment during fixed rate.<br />
            <strong>Secondary Payment:</strong> Monthly payment after fixed rate.<br />
            <strong>Remaining Years:</strong> Loan duration (can reduce with overpayment).<br />
            <strong>Remaining Balance:</strong> Leftover after fixed term ends.
          </p>
        </div>
      ) : (
        <>
          {/* INPUT FIELDS */}
          {/* (omit for brevity unless you want full section again) */}
          
          <div className="action-row">
            <button className="submit-btn" onClick={calculate}>Submit</button>
            <button className="reset-btn" onClick={resetAll}>Reset All</button>
          </div>

          {submitted && (
            <div className="results visible">
              {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{formatNumber(initialPayment)}</p>}
              {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondPayment)}</p>}
              {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
              {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}</p>}
              {interestPaid !== null && principalPaid !== null && <PieChart interest={parseFloat(interestPaid)} principal={parseFloat(principalPaid)} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
