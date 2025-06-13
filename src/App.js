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

  const formatCurrency = (value) => {
    if (value === '') return '';
    const clean = value.toString().replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num)
      ? ''
      : '£' + num.toLocaleString(undefined, { minimumFractionDigits: 0 });
  };

  const formatPercentage = (value) => {
    if (value === '') return '';
    const clean = value.toString().replace(/[^\d.]/g, '');
    return clean === '' ? '' : clean + '%';
  };

  const parseFormattedValue = (value) =>
    parseFloat(value.replace(/[^0-9.]/g, '') || 0);

  const clearAll = () => {
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
    const P = parseFormattedValue(loanAmount);
    const r1 = parseFormattedValue(initialRate) / 100 / 12;
    const r2 = parseFormattedValue(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFormattedValue(overpayment) : 0;
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
        result = Math.abs(g / 12).toFixed(2);
      } else if (op) {
        const termPmt = basePMT(P, r1, n) + op;
        const nper = Math.log(1 + (P * r1) / -termPmt) / Math.log(1 + r1);
        result = Math.abs(nper / 12).toFixed(2);
      } else {
        result = Math.abs(n / 12).toFixed(2);
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

  const InputField = ({ label, value, setValue, placeholder, formatter }) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          value={formatter ? formatter(value) : value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          inputMode="decimal"
        />
        {value && (
          <button className="clear-btn" onClick={() => setValue('')}>×</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Mortgage Calculator
        <button
          className="share-btn"
          onClick={() => navigator.share
            ? navigator.share({ title: 'Mortgage Calculator', url: window.location.href })
            : navigator.clipboard.writeText(window.location.href)}
        >
          Share
        </button>
      </h1>

      <InputField label="Loan Amount (£)" value={loanAmount} setValue={setLoanAmount} placeholder="e.g. 250,000" formatter={formatCurrency} />
      <InputField label="Loan Term (Years)" value={loanTermYears} setValue={setLoanTermYears} placeholder="e.g. 25" />
      <InputField label="Fixed Term Rate (%)" value={initialRate} setValue={setInitialRate} placeholder="e.g. 4.5" formatter={formatPercentage} />
      <InputField label="Fixed Term Length (Years)" value={fixedTermYears} setValue={setFixedTermYears} placeholder="e.g. 5" />
      <InputField label="Secondary Rate (%)" value={secondaryRate} setValue={setSecondaryRate} placeholder="e.g. 6.5" formatter={formatPercentage} />
      <InputField label="Overpayment (Optional)" value={overpayment} setValue={setOverpayment} placeholder="e.g. 100" formatter={formatCurrency} />
      <InputField label="Target Years (Optional)" value={targetYears} setValue={setTargetYears} placeholder="e.g. 15" />

      <button onClick={calculate} className="submit-btn">Submit</button>

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
