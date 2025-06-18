import React, { useState } from 'react';
import PieChart from './PieChart';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [fixedTerm, setFixedTerm] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [results, setResults] = useState(null);

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    });
  };

  const parseNumber = (value) => parseFloat(value.toString().replace(/,/g, '') || 0);

  const handleSubmit = () => {
    const P = parseNumber(loanAmount);
    const n = parseNumber(loanTerm) * 12;
    const r = parseNumber(initialRate) / 100 / 12;
    const fixedMonths = parseNumber(fixedTerm) * 12;
    const r2 = parseNumber(secondaryRate) / 100 / 12;
    const op = parseNumber(overpayment);
    const target = parseNumber(targetYears);

    if (!P || !loanTerm || !initialRate) {
      setResults(null);
      return;
    }

    let monthlyPayment = 0;
    let secondaryMonthly = 0;
    let totalMonths = n;
    let remainingBalance = 0;
    let useOverpayment = !target;

    // If only simple inputs are provided
    if (!fixedTerm || !secondaryRate) {
      monthlyPayment = PMT(r, target ? target * 12 : n, -P);
      if (useOverpayment) monthlyPayment += op;

      const actualMonths = useOverpayment
        ? NPER(r, -monthlyPayment, P)
        : target
        ? target * 12
        : n;

      const interestPaid = monthlyPayment * actualMonths - P;

      setResults({
        monthlyPayment,
        timeToComplete: actualMonths / 12,
        remainingBalance: null,
        secondaryMonthly: null,
        interestPaid,
        principalPaid: P,
      });
      return;
    }

    // Fixed + Secondary Logic
    monthlyPayment = PMT(r, target ? target * 12 : n, -P);
    if (useOverpayment) monthlyPayment += op;

    // Balance after fixed term
    let totalPaidDuringFixed = monthlyPayment * fixedMonths;
    let balanceAtFixedEnd = P * Math.pow(1 + r, fixedMonths) - monthlyPayment * ((Math.pow(1 + r, fixedMonths) - 1) / r);

    if (balanceAtFixedEnd < 0) balanceAtFixedEnd = 0;

    remainingBalance = balanceAtFixedEnd;

    // Secondary monthly payment
    secondaryMonthly = PMT(r2, n - fixedMonths, -remainingBalance);
    if (useOverpayment) secondaryMonthly += op;

    // Total time to pay off
    let timeAfterFixed = useOverpayment
      ? NPER(r2, -secondaryMonthly, balanceAtFixedEnd)
      : n - fixedMonths;

    if (target) {
      const fullMonthly = PMTWithTarget(P, r, r2, fixedMonths, (target * 12));
      monthlyPayment = fullMonthly;
      const totalInterest = monthlyPayment * (target * 12) - P;
      setResults({
        monthlyPayment,
        timeToComplete: target,
        remainingBalance: null,
        secondaryMonthly: null,
        interestPaid: totalInterest,
        principalPaid: P,
      });
      return;
    }

    const totalMonthsWithOP = fixedMonths + timeAfterFixed;
    const totalInterest =
      monthlyPayment * fixedMonths +
      secondaryMonthly * timeAfterFixed -
      P;

    setResults({
      monthlyPayment,
      secondaryMonthly,
      timeToComplete: totalMonthsWithOP / 12,
      remainingBalance: balanceAtFixedEnd,
      interestPaid: totalInterest,
      principalPaid: P,
    });
  };

  const handleReset = () => {
    setLoanAmount('');
    setLoanTerm('');
    setInitialRate('');
    setFixedTerm('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setResults(null);
  };

  // Helper functions
  const PMT = (rate, nper, pv) => {
    return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  };

  const NPER = (rate, payment, presentValue) => {
    if (rate === 0) return presentValue / payment;
    return Math.log(payment / (payment - rate * presentValue)) / Math.log(1 + rate);
  };

  const PMTWithTarget = (P, r1, r2, fixedMonths, totalTargetMonths) => {
    // Solve iteratively
    let guess = PMT(r1, totalTargetMonths, -P);
    let low = 0;
    let high = guess * 2;
    let epsilon = 0.01;
    let iteration = 0;

    while (iteration < 100) {
      const mid = (low + high) / 2;
      const balanceAfterFixed = P * Math.pow(1 + r1, fixedMonths) - mid * ((Math.pow(1 + r1, fixedMonths) - 1) / r1);
      const remainingMonths = totalTargetMonths - fixedMonths;
      const finalBalance = balanceAfterFixed * Math.pow(1 + r2, remainingMonths) - mid * ((Math.pow(1 + r2, remainingMonths) - 1) / r2);

      if (Math.abs(finalBalance) < epsilon) return mid;
      if (finalBalance > 0) low = mid;
      else high = mid;
      iteration++;
    }

    return (low + high) / 2;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>The Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => window.location.href = '/info'} title="Info">i</button>
      </div>

      {[
        { label: 'Loan Amount (£)', value: loanAmount, setter: setLoanAmount, placeholder: 'e.g. 250,000 (Required)' },
        { label: 'Loan Term (Years)', value: loanTerm, setter: setLoanTerm, placeholder: 'e.g. 25 (Required)' },
        { label: 'Initial Rate (%)', value: initialRate, setter: setInitialRate, placeholder: 'e.g. 4.5 (Required)' },
        { label: 'Fixed Term (Years)', value: fixedTerm, setter: setFixedTerm, placeholder: 'e.g. 3 (Where appropriate)' },
        { label: 'Secondary Rate (%)', value: secondaryRate, setter: setSecondaryRate, placeholder: 'e.g. 6.5 (Where appropriate)' },
        { label: 'Overpayment (£)', value: overpayment, setter: setOverpayment, placeholder: 'e.g. 100 (Optional)' },
        { label: 'Target (Years)', value: targetYears, setter: setTargetYears, placeholder: 'e.g. 15 (Optional)' },
      ].map((field, index) => (
        <div className="input-row" key={index}>
          <label>{field.label}</label>
          <input
            type="text"
            inputMode="decimal"
            value={field.value}
            onChange={(e) => field.setter(e.target.value)}
            placeholder={field.placeholder}
          />
          <button className="clear-btn" onClick={() => field.setter('')}>Clear</button>
        </div>
      ))}

      <div className="action-row">
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="reset-btn" onClick={handleReset}>Reset All</button>
      </div>

      {results && (
        <div className="results">
          <p><span>Monthly Payment:</span> <span>{formatCurrency(results.monthlyPayment)}</span></p>
          {results.secondaryMonthly !== null && (
            <p><span>Secondary Monthly Payment:</span> <span>{formatCurrency(results.secondaryMonthly)}</span></p>
          )}
          <p><span>Time to Complete Mortgage:</span> <span>{results.timeToComplete.toFixed(2)} years</span></p>
          {results.remainingBalance !== null && (
            <p><span>Remaining Balance After Fixed Term:</span> <span>{formatCurrency(results.remainingBalance)}</span></p>
          )}
          <PieChart interest={results.interestPaid} principal={results.principalPaid} />
        </div>
      )}
    </div>
  );
}

export default App;
