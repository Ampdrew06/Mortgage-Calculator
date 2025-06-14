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

  const formatNumber = (num) =>
    num.toLocaleString('en-UK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleReset = (setter) => () => setter('');

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment.replace(/,/g, '')) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      return;
    }

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(formatNumber(initial));

    if (r2 && t && n - t > 0) {
      const altPMT = basePMT(P, r1, g || n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(formatNumber(Math.abs(second)));
      setRemainingBalance(formatNumber(Math.abs(balance)));
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

    setYearsRemaining(result.replace('-', ''));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-button" onClick={() => navigator.share?.({ title: "Mortgage Calculator", url: window.location.href })}>
          Share
        </button>
      </div>

      <div className="input-group">
        <label>Loan Amount (£)</label>
        <div className="input-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 250000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value.replace(/[^\d.]/g, ''))}
          />
          <button onClick={handleReset(setLoanAmount)}>Clear</button>
        </div>

        <label>Loan Term (Years)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 25"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
          />
          <button onClick={handleReset(setLoanTermYears)}>Clear</button>
        </div>

        <label>Initial Rate (%)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 4.5"
            value={initialRate}
            onChange={(e) => setInitialRate(e.target.value)}
          />
          <button onClick={handleReset(setInitialRate)}>Clear</button>
        </div>

        <label>Fixed Rate Term (Years)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 2"
            value={fixedTermYears}
            onChange={(e) => setFixedTermYears(e.target.value)}
          />
          <button onClick={handleReset(setFixedTermYears)}>Clear</button>
        </div>

        <label>Secondary Rate (%)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 6.5"
            value={secondaryRate}
            onChange={(e) => setSecondaryRate(e.target.value)}
          />
          <button onClick={handleReset(setSecondaryRate)}>Clear</button>
        </div>

        <label>Overpayment (£)</label>
        <div className="input-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 200"
            value={overpayment}
            onChange={(e) => setOverpayment(e.target.value.replace(/[^\d.]/g, ''))}
          />
          <button onClick={handleReset(setOverpayment)}>Clear</button>
        </div>

        <label>Target Years</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 15"
            value={targetYears}
            onChange={(e) => setTargetYears(e.target.value)}
          />
          <button onClick={handleReset(setTargetYears)}>Clear</button>
        </div>
      </div>

      <div className="submit-group">
        <button className="submit-button" onClick={calculate}>Submit</button>
      </div>

      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <strong>£{initialPayment}</strong></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <strong>£{secondPayment}</strong></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <strong>{yearsRemaining}</strong></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <strong>£{remainingBalance}</strong></p>}
      </div>
    </div>
  );
}

export default App;
