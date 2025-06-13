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

  const formatCurrency = (value) => {
    const number = parseFloat(value.replace(/[£,]/g, ''));
    return isNaN(number) ? '' : '£' + number.toLocaleString();
  };

  const formatRate = (value) => {
    const number = parseFloat(value.replace(/[%]/g, ''));
    return isNaN(number) ? '' : number + '%';
  };

  const parseCurrency = (value) =>
    parseFloat(value.replace(/[£,%\s,]/g, '')) || 0;

  const clearField = (setter) => setter('');

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const calculate = () => {
    const P = parseCurrency(loanAmount);
    const r1 = parseCurrency(initialRate) / 100 / 12;
    const r2 = parseCurrency(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = parseCurrency(overpayment);
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || !t || !r2) {
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

    if (n - t > 0) {
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

    if (P === 0 || n - t <= 0) {
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

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mortgage Calculator',
        text: 'Check out this mortgage calculator!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Mortgage Calculator</h1>
        <button className="share" onClick={share}>Share</button>
      </header>

      <div className="inputs">
        <div className="input-group">
          <label>Loan Amount (£)</label>
          <div>
            <input
              type="text"
              value={loanAmount}
              onChange={(e) => setLoanAmount(formatCurrency(e.target.value))}
              placeholder="e.g. 250000"
            />
            <button onClick={() => clearField(setLoanAmount)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Loan Term (Years)</label>
          <div>
            <input
              type="number"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
              placeholder="e.g. 25"
            />
            <button onClick={() => clearField(setLoanTermYears)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Fixed Term Rate (%)</label>
          <div>
            <input
              type="text"
              value={initialRate}
              onChange={(e) => setInitialRate(formatRate(e.target.value))}
              placeholder="e.g. 4.5"
            />
            <button onClick={() => clearField(setInitialRate)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Fixed Term Length (Years)</label>
          <div>
            <input
              type="number"
              value={fixedTermYears}
              onChange={(e) => setFixedTermYears(e.target.value)}
              placeholder="e.g. 2"
            />
            <button onClick={() => clearField(setFixedTermYears)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Secondary Rate (%)</label>
          <div>
            <input
              type="text"
              value={secondaryRate}
              onChange={(e) => setSecondaryRate(formatRate(e.target.value))}
              placeholder="e.g. 6.5"
            />
            <button onClick={() => clearField(setSecondaryRate)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Overpayment (Optional)</label>
          <div>
            <input
              type="number"
              value={overpayment}
              onChange={(e) => setOverpayment(e.target.value)}
              placeholder="e.g. 100"
            />
            <button onClick={() => clearField(setOverpayment)}>Clear</button>
          </div>
        </div>

        <div className="input-group">
          <label>Target Years (Optional)</label>
          <div>
            <input
              type="number"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
              placeholder="e.g. 15"
            />
            <button onClick={() => clearField(setTargetYears)}>Clear</button>
          </div>
        </div>
      </div>

      <button className="submit" onClick={calculate}>Submit</button>

      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <span>£{initialPayment}</span></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <span>£{secondPayment}</span></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <span>{yearsRemaining} years</span></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>£{remainingBalance}</span></p>}
      </div>
    </div>
  );
}

export default App;
