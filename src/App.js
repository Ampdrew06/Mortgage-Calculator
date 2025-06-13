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

  const parseCurrency = (value) =>
    parseFloat(value.replace(/[^0-9.]/g, '') || 0);

  const parsePercentage = (value) =>
    parseFloat(value.replace(/[^0-9.]/g, '') || 0);

  const formatCurrency = (value) => {
    const num = parseCurrency(value);
    return num.toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value) => {
    const num = parsePercentage(value);
    return isNaN(num) ? '' : `${num}%`;
  };

  const handleCurrencyInput = (setter) => (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setter(raw);
  };

  const handlePercentageInput = (setter) => (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setter(raw);
  };

  const clearField = (setter) => () => setter('');

  const calculate = () => {
    const P = parseCurrency(loanAmount);
    const r1 = parsePercentage(initialRate) / 100 / 12;
    const r2 = parsePercentage(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseCurrency(overpayment) : 0;
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
      <h1>
        Mortgage Calculator
        <button
          className="share-btn"
          onClick={() => navigator.share
            ? navigator.share({ title: 'Mortgage Calculator', url: window.location.href })
            : navigator.clipboard.writeText(window.location.href)}
        >
          Share
        </button>
      </h1>

      <div className="input-group">
        <label>Loan Amount (£)</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="e.g. 250000"
            value={formatCurrency(loanAmount)}
            onChange={handleCurrencyInput(setLoanAmount)}
            inputMode="decimal"
          />
          <button onClick={clearField(setLoanAmount)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Loan Term (Years)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 25"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
          />
          <button onClick={clearField(setLoanTermYears)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Fixed Term Rate (%)</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="e.g. 4.5"
            value={formatPercentage(initialRate)}
            onChange={handlePercentageInput(setInitialRate)}
            inputMode="decimal"
          />
          <button onClick={clearField(setInitialRate)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Fixed Term Length (Years)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 2"
            value={fixedTermYears}
            onChange={(e) => setFixedTermYears(e.target.value)}
          />
          <button onClick={clearField(setFixedTermYears)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Secondary Rate (%)</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="e.g. 6.5"
            value={formatPercentage(secondaryRate)}
            onChange={handlePercentageInput(setSecondaryRate)}
            inputMode="decimal"
          />
          <button onClick={clearField(setSecondaryRate)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Overpayment (Optional)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 100"
            value={overpayment}
            onChange={(e) => setOverpayment(e.target.value)}
          />
          <button onClick={clearField(setOverpayment)}>✕</button>
        </div>
      </div>

      <div className="input-group">
        <label>Target Years (Optional)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="e.g. 15"
            value={targetYears}
            onChange={(e) => setTargetYears(e.target.value)}
          />
          <button onClick={clearField(setTargetYears)}>✕</button>
        </div>
      </div>

      <button className="submit-btn" onClick={calculate}>Submit</button>

      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <span>£{initialPayment}</span></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <span>£{secondPayment}</span></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <span>{Math.abs(yearsRemaining)}</span></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>£{remainingBalance}</span></p>}
      </div>
    </div>
  );
}

export default App;
