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

  const parse = (val) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0;

  const calculate = () => {
    const P = parse(loanAmount);
    const r1 = parse(initialRate) / 100 / 12;
    const r2 = parse(secondaryRate) / 100 / 12;
    const n = parse(loanTermYears) * 12;
    const t = parse(fixedTermYears) * 12;
    const op = parse(overpayment);
    const g = targetYears ? parse(targetYears) * 12 : null;

    if (!P || !r1 || !n || !t || !r2) {
      setInitialPayment('');
      setSecondPayment('');
      setYearsRemaining('');
      setRemainingBalance('');
      return;
    }

    const months = g || n;
    const pmt = basePMT(P, r1, months);
    setInitialPayment((Math.abs(pmt + op)).toFixed(2));

    if (n - t > 0) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      setSecondPayment((Math.abs(basePMT(balance, r2, n - t))).toFixed(2));
    } else {
      setSecondPayment('');
    }

    let result = '';
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

    if (P === 0 || n - t <= 0) {
      setRemainingBalance('');
    } else {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      setRemainingBalance(Math.abs(balance).toFixed(2));
    }
  };

  const InputField = ({ label, value, setValue, placeholder, symbol }) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {symbol && <span className="symbol">{symbol}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <button className="clear-btn" onClick={() => setValue('')}>×</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <header>
        <h1>Mortgage Calculator</h1>
        <button
          className="share"
          onClick={() =>
            navigator.share
              ? navigator.share({ title: 'Mortgage Calculator', url: window.location.href })
              : navigator.clipboard.writeText(window.location.href)
          }
        >Share</button>
      </header>

      <InputField label="Loan Amount" value={loanAmount} setValue={setLoanAmount} placeholder="e.g. 250000" symbol="£" />
      <InputField label="Loan Term (Years)" value={loanTermYears} setValue={setLoanTermYears} placeholder="e.g. 25" />
      <InputField label="Fixed Term Rate" value={initialRate} setValue={setInitialRate} placeholder="e.g. 4.5" symbol="%" />
      <InputField label="Fixed Term Length (Years)" value={fixedTermYears} setValue={setFixedTermYears} placeholder="e.g. 2" />
      <InputField label="Secondary Rate" value={secondaryRate} setValue={setSecondaryRate} placeholder="e.g. 6.5" symbol="%" />
      <InputField label="Overpayment (Optional)" value={overpayment} setValue={setOverpayment} placeholder="e.g. 100" symbol="£" />
      <InputField label="Target Years (Optional)" value={targetYears} setValue={setTargetYears} placeholder="e.g. 15" />

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
