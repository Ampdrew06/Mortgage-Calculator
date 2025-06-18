import React, { useState } from 'react';
import PieChart from './PieChart';
import InfoPage from './InfoPage';
import './App.css';

function App() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [initialRate, setInitialRate] = useState('');
  const [fixedTerm, setFixedTerm] = useState('');
  const [secondaryRate, setSecondaryRate] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [targetYears, setTargetYears] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [results, setResults] = useState(null);

  const formatNumber = (value) =>
    value.toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    });

  const parseAmount = (val) =>
    parseFloat(val.toString().replace(/,/g, '') || 0);

  const calculateResults = () => {
    const loan = parseAmount(loanAmount);
    const termYears = parseFloat(loanTerm);
    const rate1 = parseFloat(initialRate) / 100;
    const fixedYears = parseFloat(fixedTerm) || 0;
    const rate2 = parseFloat(secondaryRate) / 100 || 0;
    const over = parseFloat(overpayment) || 0;
    const target = parseFloat(targetYears);

    if (!loan || !termYears || !rate1) return;

    let monthlyPayment = 0;
    let secondaryPayment = 0;
    let remainingBalance = 0;
    let totalTerm = termYears;

    // Target overrides Overpayment
    const monthlyRate1 = rate1 / 12;
    const monthlyRate2 = rate2 / 12;

    if (target) {
      const newPayment = -PMT(monthlyRate1, target * 12, loan);
      monthlyPayment = newPayment;
      remainingBalance = 0;
      secondaryPayment = 0;
      totalTerm = target;
    } else {
      const pmt = -PMT(monthlyRate1, termYears * 12, loan);
      monthlyPayment = pmt + over;

      if (fixedYears > 0 && rate2 > 0) {
        const fv = FV(monthlyRate1, fixedYears * 12, monthlyPayment, loan);
        remainingBalance = fv;

        const remainingMonths = (termYears - fixedYears) * 12;
        secondaryPayment = -PMT(monthlyRate2, remainingMonths, fv);

        // Recalculate time to complete mortgage
        let months1 = fixedYears * 12;
        let balance = FV(monthlyRate1, months1, monthlyPayment, loan);
        let months2 = NPER(monthlyRate2, monthlyPayment, -balance);
        totalTerm = (months1 + months2) / 12;
      } else {
        totalTerm = NPER(monthlyRate1, monthlyPayment, -loan) / 12;
        secondaryPayment = 0;
        remainingBalance = 0;
      }
    }

    const totalInterest =
      (monthlyPayment * (fixedYears > 0 ? fixedYears * 12 : totalTerm * 12)) +
      (secondaryPayment * ((termYears - fixedYears) * 12 || 0)) -
      loan;

    const principalPaid = loan;

    setResults({
      monthlyPayment: formatNumber(monthlyPayment),
      secondaryPayment:
        fixedYears > 0 && rate2 > 0 ? formatNumber(secondaryPayment) : null,
      timeToComplete: totalTerm.toFixed(2) + ' years',
      remainingBalance:
        fixedYears > 0 && rate2 > 0 ? formatNumber(remainingBalance) : null,
      interest: totalInterest,
      principal: principalPaid,
    });
  };

  // --- Financial Formulas ---
  const PMT = (rate, nper, pv) =>
    rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper));

  const FV = (rate, nper, pmt, pv) =>
    pv * Math.pow(1 + rate, nper) + (pmt * (Math.pow(1 + rate, nper) - 1)) / rate;

  const NPER = (rate, pmt, pv) =>
    rate === 0 ? -(pv / pmt) : Math.log((pmt / rate + pv) / (pmt / rate)) / Math.log(1 + rate);

  const resetAll = () => {
    setLoanAmount('');
    setLoanTerm('');
    setInitialRate('');
    setFixedTerm('');
    setSecondaryRate('');
    setOverpayment('');
    setTargetYears('');
    setResults(null);
  };

  const formatLoanInput = (val) => {
    const numeric = val.replace(/[^\d.]/g, '');
    const parts = numeric.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  return showInfo ? (
    <InfoPage onBack={() => setShowInfo(false)} />
  ) : (
    <div className="container">
      <div className="header">
        <h1>The Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(true)} title="Info">
          i
        </button>
      </div>

      {[
        {
          label: 'Loan Amount (£)',
          value: loanAmount,
          setter: (e) => {
            const formatted = formatLoanInput(e.target.value);
            setLoanAmount(formatted);
          },
        },
        {
          label: 'Loan Term (Years)',
          value: loanTerm,
          setter: (e) => setLoanTerm(e.target.value),
        },
        {
          label: 'Initial Rate (%)',
          value: initialRate,
          setter: (e) => setInitialRate(e.target.value),
        },
        {
          label: 'Fixed Term (Years)',
          value: fixedTerm,
          setter: (e) => setFixedTerm(e.target.value),
        },
        {
          label: 'Secondary Rate (%)',
          value: secondaryRate,
          setter: (e) => setSecondaryRate(e.target.value),
        },
        {
          label: 'Overpayment (£)',
          value: overpayment,
          setter: (e) => setOverpayment(e.target.value),
        },
        {
          label: 'Target (Years)',
          value: targetYears,
          setter: (e) => setTargetYears(e.target.value),
        },
      ].map((field, idx) => (
        <div className="input-row" key={idx}>
          <label>{field.label}</label>
          <input
            type="text"
            inputMode="decimal"
            value={field.value}
            onChange={field.setter}
            placeholder={
              field.label.includes('Loan Amount')
                ? 'e.g. 250,000 (Required)'
                : field.label.includes('Loan Term')
                ? 'e.g. 25 (Required)'
                : field.label.includes('Initial Rate')
                ? 'e.g. 4.5 (Required)'
                : field.label.includes('Fixed Term')
                ? 'e.g. 3 (Where appropriate)'
                : field.label.includes('Secondary Rate')
                ? 'e.g. 6.5 (Where appropriate)'
                : field.label.includes('Overpayment')
                ? 'e.g. 100 (Optional)'
                : 'e.g. 15 (Optional)'
            }
          />
          <button className="clear-btn" onClick={() => field.setter({ target: { value: '' } })}>
            Clear
          </button>
        </div>
      ))}

      <div className="action-row">
        <button className="submit-btn" onClick={calculateResults}>
          Submit
        </button>
        <button className="reset-btn" onClick={resetAll}>
          Reset All
        </button>
      </div>

      {results && (
        <div className="results">
          <p>
            Monthly Payment: <span>{results.monthlyPayment}</span>
          </p>
          {results.secondaryPayment && (
            <p>
              Secondary Monthly Payment: <span>{results.secondaryPayment}</span>
            </p>
          )}
          <p>
            Time to Complete Mortgage: <span>{results.timeToComplete}</span>
          </p>
          {results.remainingBalance && (
            <p>
              Remaining Balance After Fixed Term: <span>{results.remainingBalance}</span>
            </p>
          )}
          <PieChart interest={results.interest} principal={results.principal} />
        </div>
      )}
    </div>
  );
}

export default App;
