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

  const formatCurrency = value => new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value);

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

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(formatCurrency(initial));

    if (n - t > 0) {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;

      const second = basePMT(balance, r2, n - t);
      setSecondPayment(formatCurrency(Math.abs(second)));
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
      setYearsRemaining(result < 0 ? Math.abs(result) : result);
    }

    if (P === 0 || n - t <= 0) {
      setRemainingBalance('');
    } else {
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      setRemainingBalance(formatCurrency(Math.abs(balance)));
    }
  };

  const clearInputs = () => {
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
    <div className="container">
      <h1>Mortgage Calculator
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Mortgage Calculator',
                text: 'Check out this handy mortgage calculator app!',
                url: window.location.href
              });
            } else {
              alert('Sharing is not supported on this device.');
            }
          }}
          className="share"
        >
          📤
        </button>
      </h1>
      <div className="input-section">
        <label>Loan Amount (£)</label>
        <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g. 250000" />
        <label>Loan Term (Years)</label>
        <input type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} placeholder="e.g. 25" />
        <label>Fixed Term Rate (%)</label>
        <input type="number" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} placeholder="e.g. 4.5" />
        <label>Fixed Term Length (Years)</label>
        <input type="number" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} placeholder="e.g. 2" />
        <label>Secondary Rate (%)</label>
        <input type="number" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} placeholder="e.g. 6.5" />
        <label>Overpayment (Optional)</label>
        <input type="number" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} placeholder="e.g. 100" />
        <label>Target Years (Optional)</label>
        <input type="number" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} placeholder="e.g. 15" />
        <div className="button-row">
          <button onClick={calculate}>Submit</button>
          <button onClick={clearInputs} className="clear">Clear</button>
        </div>
      </div>
      <div className="results">
        {initialPayment && <p><span>Initial Monthly Payment:</span> <span>{initialPayment}</span></p>}
        {secondPayment && <p><span>Secondary Monthly Payment:</span> <span>{secondPayment}</span></p>}
        {yearsRemaining && <p><span>Years Remaining:</span> <span>{yearsRemaining}</span></p>}
        {remainingBalance && <p><span>Remaining Balance After Fixed Term:</span> <span>{remainingBalance}</span></p>}
      </div>
    </div>
  );
}

export default App;
