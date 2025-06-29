import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    totalInterest: 0,
    totalPaid: 0,
    monthsToPayoff: 0,
  });

  const resetAll = () => {
    setBalance('');
    setApr('');
    setMonthlyPayment('');
    setTargetMonths('');
    setResultsVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const principal = parseFloat(balance.replace(/,/g, ''));
    const annualRate = parseFloat(apr) / 100;
    const monthlyRate = annualRate / 12;
    let payment = parseFloat(monthlyPayment.replace(/,/g, ''));
    const target = parseFloat(targetMonths);
    let months = 0;
    let totalInterest = 0;
    let remaining = principal;

    if (!principal || !annualRate || !payment) return;

    if (!isNaN(target)) {
      const requiredPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target));
      payment = requiredPayment;
      months = target;
      for (let i = 0; i < months; i++) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        remaining -= principalPaid;
      }
    } else {
      while (remaining > 0 && months < 1000) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        const principalPaid = payment - interest;
        if (principalPaid <= 0) break;
        remaining -= principalPaid;
        months++;
      }
    }

    const totalPaid = principal + totalInterest;

    setResultData({
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      monthsToPayoff: months,
    });

    setResultsVisible(true);
  };

  const pieChartData = {
    labels: ['Interest', 'Principal'],
    datasets: [
      {
        data: [parseFloat(resultData.totalInterest), parseFloat(balance.replace(/,/g, ''))],
        backgroundColor: ['#e74c3c', '#2ecc71'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="header-box">
        <h2>Credit Card Calculator</h2>
      </div>

      <div className="container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="input-row">
            <label htmlFor="balance-input">Balance (£)</label>
            <input
              id="balance-input"
              name="balance"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setBalance('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              name="apr"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setApr('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="monthly-payment-input">Monthly Payment (£)</label>
            <input
              id="monthly-payment-input"
              name="monthlyPayment"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setMonthlyPayment('')}>Clear</button>
          </div>

          <div className="input-row">
            <label htmlFor="target-months-input">Target (Months)</label>
            <input
              id="target-months-input"
              name="targetMonths"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="none"
              aria-haspopup="false"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            />
            <button type="button" className="clear-btn" onClick={() => setTargetMonths('')}>Clear</button>
          </div>

          <div className="button-row">
            <button className="submit-btn ccc" type="submit">Submit</button>
            <button type="button" className="reset-btn" onClick={resetAll}>Reset All</button>
          </div>
        </form>

        {resultsVisible && (
          <div className="results-box">
            <p><strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}</p>
            <p><strong>Total Interest Paid:</strong> £{parseFloat(resultData.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p><strong>Total Paid:</strong> £{parseFloat(resultData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>

            <div className="pie-chart-container">
              <Pie data={pieChartData} />
            </div>

            <p className="chart-labels">
              <span style={{ color: '#e74c3c' }}>■ Interest</span> &nbsp;&nbsp;
              <span style={{ color: '#2ecc71' }}>■ Principal</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
