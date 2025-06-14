import React, { useState } from 'react';
import './App.css';

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
  const [showResults, setShowResults] = useState(false);

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const formatNumber = (num) =>
    Number(num).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment.replace(/,/g, '')) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || !r2) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      setShowResults(false);
      return;
    }

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(formatNumber(initial));

    if (n - t > 0) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(formatNumber(Math.abs(second)));
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
      const balance = futureValue - paid;
      setRemainingBalance(formatNumber(Math.abs(balance)));
    }

    setShowResults(true);
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
    setShowResults(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => navigator.share?.({ title: 'Mortgage Calculator', url: window.location.href })}>Share</button>
      </div>

      {/* Input Fields */}
      <div className="input-row">
        <label>Loan Amount (£)</label>
        <input
          type="text"
          inputMode="decimal"
          value={loanAmount}
          onChange={(e) => {
            let rawValue = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '');
            if (!isNaN(rawValue) && rawValue !== '') {
              const parts = rawValue.split('.');
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
        <label>Initial Fixed Rate (%)</label>
        <input type="number" inputMode="decimal" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
        <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Fixed Term Length (Years)</label>
        <input type="number" inputMode="numeric" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
        <button className="clear-btn" onClick={() => setFixedTermYears('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Secondary Rate (%)</label>
        <input type="number" inputMode="decimal" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
        <button className="clear-btn" onClick={()
=> setSecondaryRate('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Overpayment (£) (Optional)</label>
        <input type="text" inputMode="decimal" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
        <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Target Years (Optional)</label>
        <input type="number" inputMode="numeric" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
        <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
      </div>

      <div className="action-row">
        <button className="submit-btn" onClick={calculate}>Submit</button>
        <button className="reset-btn" onClick={resetAll}>Reset All</button>
      </div>

      {showResults && (
        <div className="results">
          {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{initialPayment}</p>}
          {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{secondPayment}</p>}
          {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
          {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{remainingBalance}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
