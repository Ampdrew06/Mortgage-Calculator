import React, { useState } from 'react';
import './App.css';

function InfoPage({ onBack }) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Mortgage Calculator',
        text: 'Try this Mortgage Calculator App!',
        url: window.location.href,
      });
    } catch (err) {
      alert('Sharing not supported or cancelled.');
    }
  };

  return (
    <div className="info-page">
      <h2>App Information</h2>
      <p>This calculator is designed to estimate mortgage payments.</p>
      <ul>
        <li><strong>Loan Amount (£):</strong> Total loan you are borrowing.</li>
        <li><strong>Loan Term (Years):</strong> Full term of the mortgage.</li>
        <li><strong>Initial Fixed Rate (%):</strong> Interest rate during the fixed term.</li>
        <li><strong>Fixed Term Length (Years):</strong> Duration of the initial fixed rate.</li>
        <li><strong>Secondary Rate (%):</strong> Interest rate after the fixed term ends.</li>
        <li><strong>Overpayment (£):</strong> Optional monthly extra payments.</li>
        <li><strong>Target Years:</strong> Optional — goal to repay loan faster.</li>
      </ul>
      <p>
        The results will show your initial and secondary monthly payments, the years remaining if overpaying, and any balance after the fixed term.
      </p>
      <p className="disclaimer">
        <strong>Disclaimer:</strong> This tool is for illustrative purposes only. It is not financial advice. Always consult a qualified advisor before making mortgage decisions.
      </p>
      <div className="info-actions">
        <button className="submit-btn" onClick={handleShare}>Share This App</button>
        <button className="reset-btn" onClick={onBack}>Back to Calculator</button>
      </div>
    </div>
  );
}


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
  const [submitted, setSubmitted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const basePMT = (pv, rate, nper) =>
    (rate * pv) / (1 - Math.pow(1 + rate, -nper));

  const formatNumber = (value) => {
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const resetAll = () => {
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
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);
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
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
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
      const altPMT = g ? basePMT(P, r1, g) + op : basePMT(P, r1, n) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      setRemainingBalance(Math.abs(balance).toFixed(2));
    }
  };

  return (
    <div className="container">
      {showInfo ? (
        <InfoPage onBack={() => setShowInfo(false)} />
      ) : (
        <>
          <div className="header">
            <h1>Mortgage Calculator</h1>
            <button
              className="share-btn"
              onClick={() => setShowInfo(true)}
              title="View Info"
            >
              ℹ️
            </button>
          </div>

          <div className="input-row">
            <label>Loan Amount (£)</label>
            <input
              type="text"
              inputMode="numeric"
              value={loanAmount}
              onChange={(e) => {
                let raw = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '');
                if (!isNaN(raw) && raw !== '') {
                  const parts = raw.split('.');
                  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  setLoanAmount(parts.join('.'));
                } else {
                  setLoanAmount('');
                }
              }}
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input type="number" inputMode="numeric" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setLoanTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Initial Fixed Rate (%)</label>
            <input type="number" inputMode="decimal" value={initialRate} onChange={(e) => setInitialRate(e.target.value)} />
            <button className="clear-btn" onClick={() => setInitialRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Fixed Term Length (Years)</label>
            <input type="number" inputMode="numeric" value={fixedTermYears} onChange={(e) => setFixedTermYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setFixedTermYears('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input type="number" inputMode="decimal" value={secondaryRate} onChange={(e) => setSecondaryRate(e.target.value)} />
            <button className="clear-btn" onClick={() => setSecondaryRate('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Overpayment (£) (Optional)</label>
            <input type="text" inputMode="numeric" value={overpayment} onChange={(e) => setOverpayment(e.target.value)} />
            <button className="clear-btn" onClick={() => setOverpayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label>Target Years (Optional)</label>
            <input type="number" inputMode="numeric" value={targetYears} onChange={(e) => setTargetYears(e.target.value)} />
            <button className="clear-btn" onClick={() => setTargetYears('')}>Clear</button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={calculate}>Submit</button>
            <button className="reset-btn" onClick={resetAll}>Reset All</button>
          </div>

          {submitted && (
            <div className="results visible">
              {initialPayment && <p><strong>Initial Monthly Payment:</strong> £{formatNumber(initialPayment)}</p>}
              {secondPayment && <p><strong>Secondary Monthly Payment:</strong> £{formatNumber(secondPayment)}</p>}
              {yearsRemaining && <p><strong>Years Remaining:</strong> {yearsRemaining}</p>}
              {remainingBalance && <p><strong>Remaining Balance After Fixed Term:</strong> £{formatNumber(remainingBalance)}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
