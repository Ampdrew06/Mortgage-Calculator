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
  const [showInfo, setShowInfo] = useState(false);

  const [initialPayment, setInitialPayment] = useState('');
  const [secondPayment, setSecondPayment] = useState('');
  const [yearsRemaining, setYearsRemaining] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [interestTotal, setInterestTotal] = useState(0);
  const [principalTotal, setPrincipalTotal] = useState(0);

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
    setInterestTotal(0);
    setPrincipalTotal(0);
    setSubmitted(false);
  };

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      setSubmitted(true);
      return;
    }

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    if (n - t > 0 && r2 && t) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(Math.abs(second).toFixed(2));
      setRemainingBalance(Math.abs(balance).toFixed(2));
    } else {
      setSecondPayment('');
      setRemainingBalance('');
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
        result = Math.abs(nper / 12).toFixed(2);
      } else {
        result = (n / 12).toFixed(2);
      }
      setYearsRemaining(result);
    }

    // For Pie Chart
    const totalMonths = g || n;
    const totalPayment = (pmt + op) * totalMonths;
    const totalInterest = totalPayment - P;
    const interest = totalInterest > 0 ? totalInterest : 0;
    const principal = P;

    setInterestTotal(interest);
    setPrincipalTotal(principal);
    setSubmitted(true);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button
          className="info-btn"
          title="Info"
          onClick={() => setShowInfo(!showInfo)}
        >
          ℹ️
        </button>
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
            <input
              type="number"
              inputMode="numeric"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setLoanTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Fixed Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={initialRate}
              onChange={(e) => setInitialRate(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term Length (Years)</label>
            <input
              type="number"
              inputMode="numeric"
              value={fixedTermYears}
              onChange={(e) => setFixedTermYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setFixedTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={secondaryRate}
              onChange={(e) => setSecondaryRate(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£) (Optional)</label>
            <input
              type="text"
              inputMode="numeric"
              value={overpayment}
              onChange={(e) => setOverpayment(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target Years (Optional)</label>
            <input
              type="number"
              inputMode="numeric"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

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

              <PieChart principal={principalTotal} interest={interestTotal} />

              <p style={{ color: '#4caf50' }}>🟩 Principal Being Paid</p>
              <p style={{ color: '#f44336' }}>🟥 Interest Being Paid</p>
            </div>
          )}
        </>
      )}

      {showInfo && (
        <div className="info-section">
          <h2>How to Use</h2>
          <ul>
            <li><strong>Loan Amount (£):</strong> The total amount you’re borrowing.</li>
            <li><strong>Loan Term:</strong> Total loan length in years.</li>
            <li><strong>Initial Fixed Rate:</strong> Your initial interest rate (typically lower).</li>
            <li><strong>Fixed Term Length:</strong> Number of years the initial rate lasts.</li>
            <li><strong>Secondary Rate:</strong> Follows the fixed rate (e.g. standard variable rate).</li>
            <li><strong>Overpayment (£):</strong> Optional – how much extra you plan to pay monthly.</li>
            <li><strong>Target Years:</strong> Optional – number of years you want to aim to finish in.</li>
          </ul>

          <h2>Results Explained</h2>
          <p>
            If you enter overpayments or target years, you'll see how much sooner the mortgage could be paid off,
            along with the effect on monthly payments and interest paid. This tool is for illustration only.
          </p>

          <h2>Disclaimer</h2>
          <p>
            This app is for general guidance only and should not be considered financial advice.
            Speak to a qualified mortgage adviser before making any decisions.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
