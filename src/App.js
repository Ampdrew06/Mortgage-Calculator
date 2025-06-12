import React, { useState } from 'react';

function App() {
  const [loan, setLoan] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [fixedTerm, setFixedTerm] = useState('');
  const [secondRate, setSecondRate] = useState('');
  const [initialPayment, setInitialPayment] = useState(null);
  const [secondPayment, setSecondPayment] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(null);

  const calculate = () => {
    const P = parseFloat(loan.replace(/,/g, ''));
    const r1 = parseFloat(rate) / 100 / 12;
    const r2 = parseFloat(secondRate) / 100 / 12;
    const n = parseInt(term) * 12;
    const t = parseInt(fixedTerm) * 12;

    if (!P || !r1 || !n || !t || !r2) return;

    const initialMonthly = (P * r1) / (1 - Math.pow(1 + r1, -t));
    const remainingPrincipal = P * Math.pow(1 + r1, t) - initialMonthly * ((Math.pow(1 + r1, t) - 1) / r1);
    const secondaryMonthly = (remainingPrincipal * r2) / (1 - Math.pow(1 + r2, -(n - t)));

    setInitialPayment(initialMonthly.toFixed(2));
    setRemainingBalance(remainingPrincipal.toFixed(2));
    setSecondPayment(secondaryMonthly.toFixed(2));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Mortgage Calculator</h1>
      <input placeholder="Loan Amount (e.g. 150,000)" onChange={(e) => setLoan(e.target.value)} /><br />
      <input placeholder="Fixed Term Rate % (e.g. 4.5)" onChange={(e) => setRate(e.target.value)} /><br />
      <input placeholder="Loan Term (Years) (e.g. 25)" onChange={(e) => setTerm(e.target.value)} /><br />
      <input placeholder="Fixed Term Length (Years) (e.g. 5)" onChange={(e) => setFixedTerm(e.target.value)} /><br />
      <input placeholder="Secondary Interest Rate % (e.g. 6.24)" onChange={(e) => setSecondRate(e.target.value)} /><br />
      <button onClick={calculate}>Calculate</button>
      {initialPayment && (
        <div>
          <p>Initial Monthly Payment: £{initialPayment}</p>
          <p>Remaining Balance After Fixed Term: £{remainingBalance}</p>
          <p>Secondary Monthly Payment: £{secondPayment}</p>
        </div>
      )}
    </div>
  );
}

export default App;