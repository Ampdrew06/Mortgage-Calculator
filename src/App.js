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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value);

  const clearField = (setter) => () => setter('');

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || !t || !r2) {
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

  const InputRow = ({ label, value, setter, placeholder, isPercent }) => (
    <div className="input-row">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setter(e.target.value)}
          step={isPercent ? '0.01' : '1'}
        />
        {isPercent && <span className="input-symbol">%</span>}
        {!isPercent && label.includes('Loan') && <span className="input-symbol">£</span>}
        <button className="clear-btn" onClick={clearField(setter)}>✕</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <header>
        <h1>Mortgage Calculator</h1>
        <button
          className="share-btn"
          onClick={() => navigator.share ? navigator.share({ title: 'Mortgage Calculator', url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
        >
          Share
        </button>
      </header>

      <InputRow label="Loan Amount (£)" value={loanAmount} setter={setLoanAmount} placeholder="e.g. 250000" />
      <InputRow label="Loan Term (Years)" value={loanTermYears} setter={setLoanTermYears} placeholder="e.g. 25" />
      <InputRow label="Fixed Term Rate (%)" value={initialRate} setter={setInitialRate} placeholder="e.g. 4.5" isPercent />
      <InputRow label="Fixed Term Length (Years)" value={fixedTermYears} setter={setFixedTermYears} placeholder="e.g. 5" />
      <InputRow label="Secondary Rate (%)" value={secondaryRate} setter={setSecondaryRate} placeholder="e.g. 6.5" isPercent />
      <InputRow label="Overpayment (Optional)" value={overpayment} setter={setOverpayment} placeholder="e.g. 200" />
      <InputRow label="Target Years (Optional)" value={targetYears} setter={setTargetYears} placeholder="e.g. 15" />

      <button className="submit-btn" onClick={calculate}>Submit</button>

      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <span>{formatCurrency(initialPayment)}</span></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <span>{formatCurrency(secondPayment)}</span></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <span>{Math.abs(yearsRemaining)} {yearsRemaining !== 'N/A' ? 'years' : ''}</span></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>{formatCurrency(remainingBalance)}</span></p>}
      </div>
    </div>
  );
}

export default App;
