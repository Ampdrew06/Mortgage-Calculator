import React, { useState } from 'react';

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

    // --- Initial Monthly Payment ---
    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    // --- Secondary Monthly Payment ---
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

    // --- Years Remaining ---
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

    // --- Remaining Balance at Fixed Term ---
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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Mortgage Calculator</h1>
      <label>Loan Amount (£)</label>
      <input type="number" placeholder="e.g. 200000" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
      <label>Loan Term (Years)</label>
      <input type="number" placeholder="e.g. 25" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
      <label>Fixed Term Rate (%)</label>
      <input type="number" placeholder="e.g. 4.5" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
      <label>Fixed Term Length (Years)</label>
      <input type="number" placeholder="e.g. 5" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
      <label>Secondary Rate (%)</label>
      <input type="number" placeholder="e.g. 6.5" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
      <label>Overpayment (Optional)</label>
      <input type="number" placeholder="e.g. 100" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
      <label>Target Years (Optional)</label>
      <input type="number" placeholder="e.g. 15" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
      <br /><br />
      <button onClick={calculate}>Submit</button>
      <br /><br />
      {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{initialPayment}</p>}
      {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{secondPayment}</p>}
      {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
      {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{remainingBalance}</p>}
    </div>
  );
}

export default App;
