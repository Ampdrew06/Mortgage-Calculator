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

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const clearField = (setter) => () => setter('');

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = secondaryRate ? parseFloat(secondaryRate) / 100 / 12 : null;
    const n = parseInt(loanTermYears) * 12;
    const t = fixedTermYears ? parseInt(fixedTermYears) * 12 : 0;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      return;
    }

    const months = g || n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    if (t && r2 && n - t > 0) {
      const altPMT = g
        ? basePMT(P, r1, g) + op
        : basePMT(P, r1, n) + op;

      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;

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
        result = nper < 0 ? 'N/A' : Math.abs(nper / 12).toFixed(2);
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

    if (!t || P === 0 || n - t <= 0) {
      setRemainingBalance('');
    } else {
      const altPMT = g
        ? basePMT(P, r1, g) + op
        : basePMT(P, r1, n) + op;

      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;

      setRemainingBalance(Math.abs(balance).toFixed(2));
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => navigator.share?.({ title: 'Mortgage Calculator', url: window.location.href })}>
          Share
        </button>
      </header>

      <div className="input-group">
        <label>Loan Amount (£)</label>
        <div className="input-wrapper">
          <span>£</span>
          <input type="number" placeholder="e.g. 200000" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
          <button className="clear" onClick={clearField(setLoanAmount)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Loan Term (Years)</label>
        <div className="input-wrapper">
          <input type="number" placeholder="e.g. 25" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
          <button className="clear" onClick={clearField(setLoanTermYears)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Fixed Rate Term (%)</label>
        <div className="input-wrapper">
          <input type="number" placeholder="e.g. 4.5" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
          <span>%</span>
          <button className="clear" onClick={clearField(setInitialRate)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Fixed Rate Length (Years)</label>
        <div className="input-wrapper">
          <input type="number" placeholder="e.g. 5" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
          <button className="clear" onClick={clearField(setFixedTermYears)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Secondary Rate (%)</label>
        <div className="input-wrapper">
          <input type="number" placeholder="e.g. 6.5" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
          <span>%</span>
          <button className="clear" onClick={clearField(setSecondaryRate)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Overpayment (Optional)</label>
        <div className="input-wrapper">
          <span>£</span>
          <input type="number" placeholder="e.g. 100" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
          <button className="clear" onClick={clearField(setOverpayment)}>Clear</button>
        </div>
      </div>

      <div className="input-group">
        <label>Target Years (Optional)</label>
        <div className="input-wrapper">
          <input type="number" placeholder="e.g. 15" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
          <button className="clear" onClick={clearField(setTargetYears)}>Clear</button>
        </div>
      </div>

      <button className="submit" onClick={calculate}>Submit</button>

      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <span>£{initialPayment}</span></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <span>£{secondPayment}</span></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <span>{yearsRemaining}</span></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>£{remainingBalance}</span></p>}
      </div>
    </div>
  );
}

export default App;
