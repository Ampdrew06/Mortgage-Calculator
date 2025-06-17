import React, { useState } from 'react';
import PieChart from './PieChart';
import InfoPage from './InfoPage';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [fixedTermYears, setFixedTermYears] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [yearsRemaining, setYearsRemaining] = useState(null);
  const [interestPaid, setInterestPaid] = useState(0);
  const [principalPaid, setPrincipalPaid] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const formatNumber = (num) =>
    Number(num).toLocaleString('en-UK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const resetAll = () => {
    setLoanAmount('');
    setLoanTermYears('');
    setInitialRate('');
    setFixedTermYears('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setMonthlyPayment(null);
    setRemainingBalance(null);
    setYearsRemaining(null);
    setInterestPaid(0);
    setPrincipalPaid(0);
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);

    const P = parseFloat(loanAmount.replace(/,/g, ''));
    const r1 = parseFloat(initialRate) / 100 / 12 || 0;
    const r2 = parseFloat(secondaryRate) / 100 / 12 || 0;
    const n = parseInt(loanTermYears) * 12;
    const t = fixedTermYears ? parseInt(fixedTermYears) * 12 : 0;
    const op = overpayment ? parseFloat(overpayment) : 0;
    const g = targetYears ? parseInt(targetYears) * 12 : null;

    if (!P || !n || (!r1 && !r2)) return;

    let monthly;
    if (r1 > 0) {
      monthly = (P * r1) / (1 - Math.pow(1 + r1, -n));
    } else {
      monthly = P / n;
    }

    let totalInterest = 0;
    let totalPrincipal = 0;
    let balance = P;
    let months = 0;

    const rate = r1 || r2;

    while (balance > 0 && months < n) {
      const interest = balance * (months < t ? r1 : r2);
      let principal = (monthly + op) - interest;

      if (principal > balance) principal = balance;

      balance -= principal;
      totalInterest += interest;
      totalPrincipal += principal;
      months++;
    }

    setMonthlyPayment(monthly.toFixed(2));
    setRemainingBalance(balance.toFixed(2));
    setYearsRemaining((months / 12).toFixed(1));
    setInterestPaid(totalInterest.toFixed(2));
    setPrincipalPaid(totalPrincipal.toFixed(2));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(!showInfo)}>
          ℹ️
        </button>
      </div>

      {showInfo ? (
        <InfoPage />
      ) : (
        <>
          <div className="input-row">
            <label>Loan Amount (£)</label>
            <input
              type="text"
              inputMode="decimal"
              value={loanAmount}
              onChange={(e) =>
                setLoanAmount(e.target.value.replace(/[^\d.,]/g, ''))
              }
            />
            <button className="clear-btn" onClick={() => setLoanAmount('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Loan Term (Years)</label>
            <input
              type="number"
              inputMode="numeric"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setLoanTermYears('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Initial Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={initialRate}
              onChange={(e) => setInitialRate(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setInitialRate('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Fixed Term (Years)</label>
            <input
              type="number"
              inputMode="numeric"
              value={fixedTermYears}
              onChange={(e) => setFixedTermYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setFixedTermYears('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Secondary Rate (%)</label>
            <input
              type="number"
              inputMode="decimal"
              value={secondaryRate}
              onChange={(e) => setSecondaryRate(e.target.value)}
            />
            <button
              className="clear-btn"
              onClick={() => setSecondaryRate('')}
            >
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Overpayment (£) (Optional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={overpayment}
              onChange={(e) =>
                setOverpayment(e.target.value.replace(/[^\d.,]/g, ''))
              }
            />
            <button className="clear-btn" onClick={() => setOverpayment('')}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label>Target Term (Years) (Optional)</label>
            <input
              type="number"
              inputMode="numeric"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
            />
            <button className="clear-btn" onClick={() => setTargetYears('')}>
              Clear
            </button>
          </div>

          <div className="action-row">
            <button className="submit-btn" onClick={calculate}>
              Submit
            </button>
            <button className="reset-btn" onClick={resetAll}>
              Reset All
            </button>
          </div>

          {submitted && (
            <div className="results visible">
              {monthlyPayment && (
                <p>
                  <strong>Initial Monthly Payment:</strong> £
                  {formatNumber(monthlyPayment)}
                </p>
              )}
              {yearsRemaining && (
                <p>
                  <strong>Years Remaining:</strong> {yearsRemaining}
                </p>
              )}
              {remainingBalance && (
                <p>
                  <strong>Remaining Balance After Fixed Term:</strong> £
                  {formatNumber(remainingBalance)}
                </p>
              )}
              {(interestPaid > 0 || principalPaid > 0) && (
                <PieChart
                  interest={parseFloat(interestPaid)}
                  principal={parseFloat(principalPaid)}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
