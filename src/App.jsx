import React, { useState } from 'react';
import './App.css';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [pieData, setPieData] = useState(null);

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
    setPieData(null);
  };

  const calculate = () => {
    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12;
    const r2 = parseFloat(secondaryRate) / 100 / 12;
    const n = parseInt(loanTermYears) * 12;
    const t = parseInt(fixedTermYears) * 12;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !r1 || !n) {
      return;
    }

    setSubmitted(true);

    const months = g ? g : n;
    const pmt = basePMT(P, r1, months);
    const initial = Math.abs(pmt + op);
    setInitialPayment(initial.toFixed(2));

    if (n - t > 0 && t > 0) {
      const altPMT = basePMT(P, r1, months) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      const second = basePMT(balance, r2, n - t);
      setSecondPayment(Math.abs(second).toFixed(2));

      // PIE CHART LOGIC
      const totalPaid = initial * t + second * (n - t);
      const interestPaid = totalPaid - P;
      setPieData({
        labels: ['Principal Paid', 'Interest Paid'],
        datasets: [
          {
            data: [P, interestPaid],
            backgroundColor: ['green', 'red'],
            borderWidth: 1,
          },
        ],
      });
    } else {
      setSecondPayment('');
      const totalPaid = initial * n;
      const interestPaid = totalPaid - P;
      setPieData({
        labels: ['Principal Paid', 'Interest Paid'],
        datasets: [
          {
            data: [P, interestPaid],
            backgroundColor: ['green', 'red'],
            borderWidth: 1,
          },
        ],
      });
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
      const altPMT = basePMT(P, r1, months) + op;
      const futureValue = P * Math.pow(1 + r1, t);
      const paid = altPMT * ((Math.pow(1 + r1, t) - 1) / r1);
      const balance = futureValue - paid;
      setRemainingBalance(Math.abs(balance).toFixed(2));
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" title="Info" onClick={() => setShowInfo(!showInfo)}>ℹ️</button>
      </div>

      {!showInfo && (
        <>
          {/* INPUT FIELDS */}
          {[
            ['Loan Amount (£)', loanAmount, setLoanAmount, 'text'],
            ['Loan Term (Years)', loanTermYears, setLoanTermYears, 'number'],
            ['Initial Rate (%)', initialRate, setInitialRate, 'number'],
            ['Fixed Term (Years)', fixedTermYears, setFixedTermYears, 'number'],
            ['Secondary Rate (%)', secondaryRate, setSecondaryRate, 'number'],
            ['Overpayment (£) (Optional)', overpayment, setOverpayment, 'text'],
            ['Target Years (Optional)', targetYears, setTargetYears, 'number'],
          ].map(([label, value, setter, type]) => (
            <div className="input-row" key={label}>
              <label>{label}</label>
              <input
                type={type}
                inputMode={type === 'text' ? 'numeric' : 'decimal'}
                value={value}
                onChange={(e) => {
                  let val = e.target.value;
                  if (label.includes('Amount') || label.includes('Overpayment')) {
                    val = val.replace(/,/g, '').replace(/[^\d.]/g, '');
                    if (!isNaN(val) && val !== '') {
                      const parts = val.split('.');
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                      val = parts.join('.');
                    } else val = '';
                  }
                  setter(val);
                }}
              />
              <button className="clear-btn" onClick={() => setter('')}>Clear</button>
            </div>
          ))}

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

              {pieData && (
                <>
                  <div style={{ maxWidth: '300px', margin: '1rem auto' }}>
                    <Pie data={pieData} width={250} height={250} />
                  </div>
                  <p style={{ color: 'green' }}>🟩 Principal Being Paid</p>
                  <p style={{ color: 'red' }}>🟥 Interest Being Paid</p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {showInfo && (
        <div className="info-section">
          <h2>How It Works</h2>
          <ul>
            <li><strong>Loan Amount:</strong> Total amount borrowed.</li>
            <li><strong>Initial Rate:</strong> Fixed interest rate for the initial period.</li>
            <li><strong>Loan Term:</strong> Total duration of the mortgage.</li>
            <li><strong>Fixed Term:</strong> Years under the initial fixed rate.</li>
            <li><strong>Secondary Rate:</strong> Rate after the fixed term ends.</li>
            <li><strong>Overpayment:</strong> Extra payment added monthly.</li>
            <li><strong>Target Years:</strong> Optional time goal for full repayment.</li>
          </ul>
          <p>This app is for guidance only and not financial advice. Always consult a qualified mortgage advisor.</p>
        </div>
      )}
    </div>
  );
}

export default App;
