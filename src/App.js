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
    const clean = value.replace(/[^0-9.]/g, '');
    const [whole, decimal] = clean.split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
  };

  const handleLoanInput = (e) => {
    const raw = e.target.value;
    if (/^[\d,]*\.?\d*$/.test(raw)) {
      setLoanAmount(formatNumber(raw));
    }
  };

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const clearFields = () => {
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

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || !r2) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      return;
    }

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    if (n - t > 0 && t > 0) {
      const altPMT = g
        ? basePMT(P, r1, g) + op
        : basePMT(P, r1, n) + op;

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
        result = (nper / 12).toFixed(2);
      } else {
        result = (n / 12).toFixed(2);
      }

      setYearsRemaining(result.startsWith('-') ? result.slice(1) : result);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Mortgage Calculator</h1>
        <button className="share-button" onClick={() => navigator.share ? navigator.share({ title: "Mortgage Calculator", url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}>Share</button>
      </header>

      <div className="input-row">
        <label>Loan Amount (£)</label>
        <div className="input-prefix">
          <span>£</span>
          <input type="text" placeholder="e.g. 250,000" value={loanAmount} onChange={handleLoanInput} />
          <button onClick={() => setLoanAmount('')}>Clear</button>
        </div>

        <label>Loan Term (Years)</label>
        <div className="input-prefix">
          <input type="number" placeholder="e.g. 25" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
          <button onClick={() => setLoanTermYears('')}>Clear</button>
        </div>

        <label>Fixed Rate Term (%)</label>
        <div className="input-prefix">
          <input type="number" placeholder="e.g. 4.5" step="0.01" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
          <span>%</span>
          <button onClick={() => setInitialRate('')}>Clear</button>
        </div>

        <label>Fixed Term Length (Years)</label>
        <div className="input-prefix">
          <input type="number" placeholder="e.g. 2" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
          <button onClick={() => setFixedTermYears('')}>Clear</button>
        </div>

        <label>Secondary Rate (%)</label>
        <div className="input-prefix">
          <input type="number" placeholder="e.g. 6.5" step="0.01" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
          <span>%</span>
          <button onClick={() => setSecondaryRate('')}>Clear</button>
        </div>

        <label>Overpayment (Optional)</label>
        <div className="input-prefix">
          <span>£</span>
          <input type="number" placeholder="e.g. 200" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
          <button onClick={() => setOverpayment('')}>Clear</button>
        </div>

        <label>Target Years (Optional)</label>
        <div className="input-prefix">
          <input type="number" placeholder="e.g. 15" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
          <button onClick={() => setTargetYears('')}>Clear</button>
        </div>
      </div>

      <div className="button-row">
        <button className="submit" onClick={calculate}>Submit</button>
        <button className="clear" onClick={clearFields}>Reset All</button>
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
