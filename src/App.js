console.log("App.js latest is loaded");
import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputs, setInputs] = useState({
    loanAmount: '',
    initialRate: '',
    loanTermYears: '',
    fixedTermYears: '',
    secondaryRate: '',
    overpayment: '',
    targetYears: '',
  });

  const [results, setResults] = useState({
    initialPayment: '',
    secondPayment: '',
    yearsRemaining: '',
    remainingBalance: '',
  });

  const handleChange = (e, field, format) => {
    let value = e.target.value;

    // Handle formatting
    if (format === 'currency') {
      value = value.replace(/[^\d.]/g, '');
      if (value) {
        const [int, dec] = value.split('.');
        value = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + dec : '');
      }
    } else if (format === 'percent') {
      value = value.replace(/[^\d.]/g, '');
    }

    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearField = (field) => {
    setInputs(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const calculate = () => {
    const {
      loanAmount,
      initialRate,
      loanTermYears,
      fixedTermYears,
      secondaryRate,
      overpayment,
      targetYears
    } = inputs;

    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n || !t || !r2) {
      setResults({
        initialPayment: '',
        secondPayment: '',
        yearsRemaining: '',
        remainingBalance: '',
      });
      return;
    }

    // Initial Monthly Payment
    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);

    // Secondary Monthly Payment
    let second = '';
    let balance = 0;
    if (n - t > 0) {
      const altPMT = g
        ? basePMT(P, r1, g) + op
        : basePMT(P, r1, n) + op;

      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      balance = futureValue - paid;

      second = Math.abs(basePMT(balance, r2, n - t)).toFixed(2);
    }

    // Years Remaining
    let remaining = '';
    if (P === 0) {
      remaining = '';
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

      remaining = result.startsWith('-') ? result.slice(1) : result;
    }

    // Balance After Fixed Term
    const finalBalance = balance && balance > 0 ? balance.toFixed(2) : '0.00';

    setResults({
      initialPayment: initial.toFixed(2),
      secondPayment: second,
      yearsRemaining: remaining,
      remainingBalance: finalBalance,
    });
  };

  return (
    <div className="container">
      <h1>
        Mortgage Calculator
        <button className="share-button" onClick={() => navigator.share?.({ title: "Mortgage Calculator", url: window.location.href })}>
          Share
        </button>
      </h1>

      {[
        ['Loan Amount (£)', 'loanAmount', 'currency', 'e.g. 250,000'],
        ['Loan Term (Years)', 'loanTermYears', 'number', 'e.g. 25'],
        ['Fixed Rate Term (%)', 'initialRate', 'percent', 'e.g. 4.5'],
        ['Fixed Term Length (Years)', 'fixedTermYears', 'number', 'e.g. 5'],
        ['Secondary Rate (%)', 'secondaryRate', 'percent', 'e.g. 6.5'],
        ['Overpayment (£)', 'overpayment', 'currency', 'e.g. 100'],
        ['Target Years (Optional)', 'targetYears', 'number', 'e.g. 15']
      ].map(([label, key, type, placeholder]) => (
        <div className="input-group" key={key}>
          <label>{label}</label>
          <div className="input-row">
            <input
              type="text"
              inputMode="decimal"
              value={inputs[key]}
              placeholder={placeholder}
              onChange={(e) => handleChange(e, key, type)}
            />
            <button className="clear" onClick={() => clearField(key)}>Clear</button>
          </div>
        </div>
      ))}

      <button className="submit" onClick={calculate}>Submit</button>

      <div className="results">
        {results.initialPayment && <p><span>Initial Monthly Payment:</span> <span>£{results.initialPayment}</span></p>}
        {results.secondPayment && <p><span>Secondary Monthly Payment:</span> <span>£{results.secondPayment}</span></p>}
        {results.yearsRemaining && <p><span>Years Remaining:</span> <span>{results.yearsRemaining}</span></p>}
        {results.remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>£{results.remainingBalance}</span></p>}
      </div>
    </div>
  );
}

export default App;
