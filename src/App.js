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

  const formatNumber = (value) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const handleSubmit = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears || 0) * 12;
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

    if (t && n - t > 0 && r2) {
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
    }

    if (P === 0 || !t || n - t <= 0) {
      setRemainingBalance('');
    } else {
      const altPMT = g
        ? basePMT(P, r1, g) + op
        : basePMT(P, r1, n) + op;

      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;

      const formattedBalance = Math.abs(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setRemainingBalance(formattedBalance);
    }
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
  };

  return (
    <div className="app-container">
      <h1>
        Mortgage Calculator
        <button className="share-btn" onClick={() => navigator.share ? navigator.share({ title: 'Mortgage Calculator', url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}>Share</button>
      </h1>

      <div className="input-group">
        <label>Loan Amount</label>
        <div className="input-prefix">
          <span>£</span>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(formatNumber(e.target.value))}
            placeholder="e.g. 250,000"
          />
          <button onClick={() => setLoanAmount('')}>Clear</button>
        </div>

        <label>Initial Fixed Rate</label>
        <div className="input-prefix">
          <input
            type="number"
            step="0.01"
            value={initialRate}
            onChange={(e) => setInitialRate(e.target.value)}
            placeholder="e.g. 4.5"
          />
          <span>%</span>
          <button onClick={() => setInitialRate('')}>Clear</button>
        </div>

        <label>Loan Term (Years)</label>
        <div className="input-prefix">
          <input
            type="number"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
            placeholder="e.g. 25"
          />
          <button onClick={() => setLoanTermYears('')}>Clear</button>
        </div>

        <label>Fixed Rate Term (Years)</label>
        <div className="input-prefix">
          <input
            type="number"
            value={fixedTermYears}
            onChange={(e) => setFixedTermYears(e.target.value)}
            placeholder="e.g. 5"
          />
          <button onClick={() => setFixedTermYears('')}>Clear</button>
        </div>

        <label>Secondary Rate</label>
        <div className="input-prefix">
          <input
            type="number"
            step="0.01"
            value={secondaryRate}
            onChange={(e) => setSecondaryRate(e.target.value)}
            placeholder="e.g. 6.5"
          />
          <span>%</span>
          <button onClick={() => setSecondaryRate('')}>Clear</button>
        </div>

        <label>Overpayment (Optional)</label>
        <div className="input-prefix">
          <span>£</span>
          <input
            type="number"
            value={overpayment}
            onChange={(e) => setOverpayment(e.target.value)}
            placeholder="e.g. 100"
          />
          <button onClick={() => setOverpayment('')}>Clear</button>
        </div>

        <label>Target Years (Optional)</label>
        <div className="input-prefix">
          <input
            type="number"
            value={targetYears}
            onChange={(e) => setTargetYears(e.target.value)}
            placeholder="e.g. 15"
          />
          <button onClick={() => setTargetYears('')}>Clear</button>
        </div>
      </div>

      <div className="button-row">
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="reset-btn" onClick={resetAll}>Reset All</button>
      </div>

      <div className="results">
        {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{initialPayment}</p>}
        {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{secondPayment}</p>}
        {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
        {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{remainingBalance}</p>}
      </div>
    </div>
  );
}

export default App;
