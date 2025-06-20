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

  const calculate = () => {
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
      // If target months provided, solve for required payment instead
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
      // Normal iterative calculation
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
    <div className="calculator-container">
      <div className="header-box">
        <h2>Credit Card Calculator</h2>
      </div>

      <div className="input-row">
        <label>Balance (£)</label>
        <input
          type="text"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <button className="clear-btn" onClick={() => setBalance('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>APR (%)</label>
        <input
          type="text"
          inputMode="decimal"
          value={apr}
          onChange={(e) => setApr(e.target.value)}
        />
        <button className="clear-btn" onClick={() => setApr('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Monthly Payment (£)</label>
        <input
          type="text"
          inputMode="decimal"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(e.target.value)}
        />
        <button className="clear-btn" onClick={() => setMonthlyPayment('')}>Clear</button>
      </div>

      <div className="input-row">
        <label>Target (Months)</label>
        <input
          type="text"
          inputMode="numeric"
          value={targetMonths}
          onChange={(e) => setTargetMonths(e.target.value)}
        />
        <button className="clear-btn" onClick={() => setTargetMonths('')}>Clear</button>
      </div>

      <div className="button-row">
        <button className="submit-btn" onClick={calculate}>Submit</button>
        <button className="reset-btn" onClick={resetAll}>Reset All</button>
      </div>

      {resultsVisible && (
        <div className="results-box">
          <p><strong>Months to Pay Off:</strong> {resultData.monthsToPayoff}</p>
          <p><strong>Total Interest Paid:</strong> £{parseFloat(resultData.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p><strong>Total Paid:</strong> £{parseFloat(resultData.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <Pie data={pieChartData} />
          <p className="chart-labels">
            <span style={{ color: '#e74c3c' }}>■ Interest</span> &nbsp;&nbsp;
            <span style={{ color: '#2ecc71' }}>■ Principal</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditCardCalculator;

