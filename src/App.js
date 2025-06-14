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

  const basePMT = (pv, rate, nper) => (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const formatCurrency = (value) =>
    value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

  const handleInputChange = (setter, value, type = 'number') => {
    if (type === 'percent') {
      value = value.replace(/[^\d.]/g, '');
      if (value === '') {
        setter('');
      } else {
        setter(parseFloat(value).toString());
      }
    } else if (type === 'currency') {
      value = value.replace(/[^\d.]/g, '');
      if (value === '') {
        setter('');
      } else {
        const formatted = parseFloat(value).toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        setter(formatted);
      }
    } else {
      setter(value);
    }
  };

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
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment.replace(/,/g, '')) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || (!t && !g) || !r2) {
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

    if (n - t > 0 && t !== 0) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;

      const second = basePMT(balance, r2, n - t);
      setSecondPayment(Math.abs(second).toFixed(2));
      setRemainingBalance(Math.abs(balance).toLocaleString('en-GB', { minimumFractionDigits: 2 }));
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

    if (parseFloat(result) < 0) {
      result = Math.abs(result);
    }

    setYearsRemaining(result);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <div className="header-buttons">
          <button className="small-button" title="Share this app" onClick={() => navigator.share?.({ title: 'Mortgage Calculator', url: window.location.href })}>Share</button>
        </div>
      </div>

      <div className="input-group">
        <label>Loan Amount</label>
        <div className="input-symbol">
          <span>£</span>
          <input type="text" inputMode="numeric" placeholder="e.g. 250000" value={loanAmount} onChange={(e) => handleInputChange(setLoanAmount, e.target.value, 'currency')} />
        </div>
        <button className="clear-button" onClick={() => setLoanAmount('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Loan Term (Years)</label>
        <input type="number" placeholder="e.g. 25" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
        <button className="clear-button" onClick={() => setLoanTermYears('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Fixed Rate Term (%)</label>
        <div className="input-symbol">
          <input type="text" inputMode="decimal" placeholder="e.g. 4.5" value={initialRate} onChange={(e) => handleInputChange(setInitialRate, e.target.value, 'percent')} />
          <span>%</span>
        </div>
        <button className="clear-button" onClick={() => setInitialRate('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Fixed Term Length (Years)</label>
        <input type="number" placeholder="e.g. 5" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
        <button className="clear-button" onClick={() => setFixedTermYears('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Secondary Rate (%)</label>
        <div className="input-symbol">
          <input type="text" inputMode="decimal" placeholder="e.g. 6.5" value={secondaryRate} onChange={(e) => handleInputChange(setSecondaryRate, e.target.value, 'percent')} />
          <span>%</span>
        </div>
        <button className="clear-button" onClick={() => setSecondaryRate('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Overpayment (Optional)</label>
        <div className="input-symbol">
          <span>£</span>
          <input type="text" inputMode="decimal" placeholder="e.g. 100" value={overpayment} onChange={(e) => handleInputChange(setOverpayment, e.target.value, 'currency')} />
        </div>
        <button className="clear-button" onClick={() => setOverpayment('')}>Clear</button>
      </div>

      <div className="input-group">
        <label>Target Years (Optional)</label>
        <input type="number" placeholder="e.g. 15" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
        <button className="clear-button" onClick={() => setTargetYears('')}>Clear</button>
      </div>

      <div className="button-row">
        <button onClick={calculate}>Submit</button>
        <button onClick={clearAll} className="reset">Reset All</button>
      </div>

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
