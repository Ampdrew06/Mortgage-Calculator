import React, { useState } from 'react';
import './App.css';
import PieChart from './PieChart';
import InfoPage from './InfoPage';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [fixedTerm, setFixedTerm] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({});
  const [showInfo, setShowInfo] = useState(false);

  const parseNumber = (value) => parseFloat(value.toString().replace(/,/g, ''));

  const formatCurrency = (value) => value?.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const calculate = () => {
    const P = parseNumber(loanAmount);
    const N = parseNumber(loanTerm);
    const r1 = parseNumber(initialRate) / 100 / 12;
    const fixedN = parseNumber(fixedTerm);
    const r2 = parseNumber(secondaryRate) / 100 / 12;
    const op = parseNumber(overpayment) || 0;
    const T = parseNumber(targetYears);

    let monthlyPayment = 0;
    let secondaryMonthly = null;
    let timeToComplete = null;
    let balanceAfterFixed = null;
    let interestPaid = 0;
    let principalPaid = 0;

    // If only the basic fields are filled
    if (P && N && initialRate && !fixedTerm && !secondaryRate) {
      const months = T ? T * 12 : N * 12;
      monthlyPayment = PMT(r1, months, -P);
      if (!T && op) {
        monthlyPayment += op;
      }
      if (T) {
        timeToComplete = T;
      } else {
        timeToComplete = N;
      }
      const totalPayments = monthlyPayment * months;
      interestPaid = totalPayments - P;
      principalPaid = P;
    }

    // If fixed and secondary rates are filled
    if (P && N && initialRate && fixedTerm && secondaryRate) {
      let basePayment;
      const monthsFixed = fixedN * 12;
      const monthsRemaining = N * 12 - monthsFixed;

      // If a target is entered, ignore overpayment
      if (T) {
        const targetMonths = T * 12;
        monthlyPayment = PMT(r1, targetMonths, -P);
        timeToComplete = T;
        balanceAfterFixed = FV(r1, monthsFixed, -monthlyPayment, -P);
        secondaryMonthly = PMT(r2, targetMonths - monthsFixed, -balanceAfterFixed);
        interestPaid = (monthlyPayment * monthsFixed) + (secondaryMonthly * (targetMonths - monthsFixed)) - P;
        principalPaid = P;
      } else {
        // Overpayment included
        basePayment = PMT(r1, N * 12, -P);
        monthlyPayment = basePayment + op;

        // Balance after fixed term
        balanceAfterFixed = FV(r1, monthsFixed, -monthlyPayment, -P);

        // If term ends at fixed point
        if (monthsRemaining <= 0) {
          timeToComplete = fixedN;
          secondaryMonthly = 0;
        } else {
          secondaryMonthly = PMT(r2, monthsRemaining, -balanceAfterFixed);
          timeToComplete = fixedN;
          let balance = balanceAfterFixed;
          let months = 0;

          while (balance > 0 && months < 1000) {
            balance = balance * (1 + r2) - secondaryMonthly;
            months++;
          }
          timeToComplete += months / 12;
        }

        const totalPayments = (monthlyPayment * monthsFixed) + (secondaryMonthly * (timeToComplete * 12 - monthsFixed));
        interestPaid = totalPayments - P;
        principalPaid = P;
      }
    }

    setResults({
      monthlyPayment: formatCurrency(monthlyPayment),
      secondaryMonthly: secondaryMonthly !== null ? formatCurrency(secondaryMonthly) : null,
      timeToComplete: timeToComplete ? timeToComplete.toFixed(2) : null,
      balanceAfterFixed: balanceAfterFixed !== null ? formatCurrency(balanceAfterFixed) : null,
      interestPaid,
      principalPaid
    });
    setShowResults(true);
  };

  const PMT = (rate, nper, pv) => rate === 0 ? pv / nper : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  const FV = (rate, nper, pmt, pv) => pv * Math.pow(1 + rate, nper) + pmt * ((Math.pow(1 + rate, nper) - 1) / rate);

  const reset = () => {
    setLoanAmount('');
    setLoanTerm('');
    setInitialRate('');
    setFixedTerm('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setShowResults(false);
    setResults({});
  };

  if (showInfo) return <InfoPage onBack={() => setShowInfo(false)} />;

  return (
    <div className="container">
      <div className="header">
        <h1>The Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(true)} title="Info">i</button>
      </div>

      {[
        { label: 'Loan Amount (£)', value: loanAmount, setter: setLoanAmount, placeholder: 'e.g. 250,000 (Required)', type: 'text' },
        { label: 'Loan Term (Years)', value: loanTerm, setter: setLoanTerm, placeholder: 'e.g. 25 (Required)' },
        { label: 'Initial Rate (%)', value: initialRate, setter: setInitialRate, placeholder: 'e.g. 4.5 (Required)' },
        { label: 'Fixed Term (Years)', value: fixedTerm, setter: setFixedTerm, placeholder: 'e.g. 3 (Where appropriate)' },
        { label: 'Secondary Rate (%)', value: secondaryRate, setter: setSecondaryRate, placeholder: 'e.g. 6.5 (Where appropriate)' },
        { label: 'Overpayment (£)', value: overpayment, setter: setOverpayment, placeholder: 'e.g. 100 (Optional)' },
        { label: 'Target (Years)', value: targetYears, setter: setTargetYears, placeholder: 'e.g. 15 (Optional)' },
      ].map((input, idx) => (
        <div className="input-row" key={idx}>
          <label>{input.label}</label>
          <input
            type={input.type || 'number'}
            inputMode="decimal"
            value={input.value}
            placeholder={input.placeholder}
            onChange={(e) => input.setter(e.target.value)}
          />
          <button className="clear-btn" onClick={() => input.setter('')}>Clear</button>
        </div>
      ))}

      <div className="action-row">
        <button className="submit-btn" onClick={calculate}>Submit</button>
        <button className="reset-btn" onClick={reset}>Reset All</button>
      </div>

      {showResults && (
        <div className="results">
          <p><span>Monthly Payment:</span><span>{results.monthlyPayment}</span></p>
          {results.secondaryMonthly && <p><span>Secondary Monthly Payment:</span><span>{results.secondaryMonthly}</span></p>}
          {results.timeToComplete && <p><span>Time to Complete Mortgage:</span><span>{results.timeToComplete} years</span></p>}
          {results.balanceAfterFixed && <p><span>Remaining Balance After Fixed Term:</span><span>{results.balanceAfterFixed}</span></p>}
          <PieChart interest={results.interestPaid} principal={results.principalPaid} />
        </div>
      )}
    </div>
  );
}

export default App;
