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
  const [showInfo, setShowInfo] = useState(false);
  const [results, setResults] = useState(null);

  const parseNumber = (val) => parseFloat(val.toString().replace(/,/g, '') || 0);

  const formatNumber = (num) =>
    num?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '£0.00';

  const calculateResults = () => {
    const loan = parseNumber(loanAmount);
    const term = parseNumber(loanTerm);
    const rate = parseNumber(initialRate) / 100;
    const fixed = parseNumber(fixedTerm);
    const secondary = parseNumber(secondaryRate) / 100;
    const over = parseNumber(overpayment);
    const target = parseNumber(targetYears);

    if (!loan || !term || !rate) {
      setResults(null);
      return;
    }

    // Helper functions
    const PMT = (ratePerPeriod, totalPayments, principal) => {
      if (ratePerPeriod === 0) return principal / totalPayments;
      return (
        (principal * ratePerPeriod) /
        (1 - Math.pow(1 + ratePerPeriod, -totalPayments))
      );
    };

    const NPER = (ratePerPeriod, payment, presentValue) => {
      if (ratePerPeriod === 0) return presentValue / payment;
      return (
        Math.log(payment / (payment - ratePerPeriod * presentValue)) /
        Math.log(1 + ratePerPeriod)
      );
    };

    let monthlyPayment = 0;
    let secondMonthlyPayment = 0;
    let remainingBalance = 0;
    let yearsRemaining = term;

    // If Target is entered, override Overpayment
    const useOverpayment = !target;

    // SIMPLE MODE
    if (!fixedTerm && !secondaryRate) {
      const termMonths = term * 12;
      if (target) {
        const newPayment = PMT(rate / 12, target * 12, loan);
        monthlyPayment = newPayment;
        yearsRemaining = target;
      } else {
        const basePayment = PMT(rate / 12, termMonths, loan);
        monthlyPayment = basePayment + (useOverpayment ? over : 0);
        yearsRemaining = useOverpayment
          ? NPER(rate / 12, -monthlyPayment, loan) / 12
          : term;
      }
    } else {
      // FULL MODE
      const fixedMonths = fixed * 12;
      const totalMonths = term * 12;

      const initialPayment = PMT(rate / 12, target ? target * 12 : totalMonths, loan);
      monthlyPayment = initialPayment + (useOverpayment ? over : 0);

      let balance = 0;
      for (let i = 0; i < fixedMonths; i++) {
        const interest = loan * rate / 12;
        const principal = monthlyPayment - interest;
        loan -= principal;
      }

      remainingBalance = loan;

      if (target) {
        const totalPayment = PMT(rate / 12, target * 12, parseNumber(loanAmount));
        monthlyPayment = totalPayment;
        const fixedPaid = PMT(rate / 12, fixedMonths, parseNumber(loanAmount));
        for (let i = 0; i < fixedMonths; i++) {
          const interest = parseNumber(loanAmount) * rate / 12;
          const principal = monthlyPayment - interest;
          loan -= principal;
        }
        secondMonthlyPayment = PMT(secondary / 12, (term - fixed) * 12, loan);
        yearsRemaining = target;
      } else {
        secondMonthlyPayment = PMT(secondary / 12, (term - fixed) * 12, remainingBalance);
        if (useOverpayment) {
          let balance = remainingBalance;
          let months = 0;
          while (balance > 0 && months < (term - fixed) * 12) {
            const interest = balance * secondary / 12;
            const principal = (secondMonthlyPayment + over) - interest;
            balance -= principal;
            months++;
          }
          yearsRemaining = fixed + months / 12;
        } else {
          yearsRemaining = term;
        }
      }
    }

    const totalInterest =
      (monthlyPayment * 12 * (target || term)) -
      parseNumber(loanAmount);
    const principalPaid = parseNumber(loanAmount);

    setResults({
      monthlyPayment: formatNumber(monthlyPayment),
      secondMonthlyPayment:
        fixedTerm && secondaryRate ? formatNumber(secondMonthlyPayment) : null,
      remainingBalance: fixedTerm && secondaryRate
        ? formatNumber(remainingBalance)
        : null,
      yearsRemaining: yearsRemaining.toFixed(2),
      interest: Math.max(totalInterest, 0),
      principal: principalPaid,
    });
  };

  return showInfo ? (
    <InfoPage onBack={() => setShowInfo(false)} />
  ) : (
    <div className="container">
      <div className="header">
        <h1>The Mortgage Calculator</h1>
        <button className="share-btn" onClick={() => setShowInfo(true)} title="Info">i</button>
      </div>

      {[
        ['Loan Amount (£)', loanAmount, setLoanAmount, 'e.g. 250,000 (Required)'],
        ['Loan Term (Years)', loanTerm, setLoanTerm, 'e.g. 25 (Required)'],
        ['Initial Rate (%)', initialRate, setInitialRate, 'e.g. 4.5 (Required)'],
        ['Fixed Term (Years)', fixedTerm, setFixedTerm, 'e.g. 3 (Where appropriate)'],
        ['Secondary Rate (%)', secondaryRate, setSecondaryRate, 'e.g. 6.5 (Where appropriate)'],
        ['Overpayment (£)', overpayment, setOverpayment, 'e.g. 100 (Optional)'],
        ['Target (Years)', targetYears, setTargetYears, 'e.g. 15 (Optional)'],
      ].map(([label, value, setter, placeholder], i) => (
        <div className="input-row" key={i}>
          <label>{label}</label>
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setter(e.target.value)}
          />
          <button className="clear-btn" onClick={() => setter('')}>Clear</button>
        </div>
      ))}

      <div className="action-row">
        <button className="submit-btn" onClick={calculateResults}>Submit</button>
        <button className="reset-btn" onClick={() => {
          setLoanAmount('');
          setLoanTerm('');
          setInitialRate('');
          setFixedTerm('');
          setSecondaryRate('');
          setOverpayment('');
          setTargetYears('');
          setResults(null);
        }}>Reset All</button>
      </div>

      {results && (
        <div className="results">
          <p><span>Monthly Payment:</span><span>{results.monthlyPayment}</span></p>
          {results.secondMonthlyPayment && (
            <p><span>Secondary Monthly Payment:</span><span>{results.secondMonthlyPayment}</span></p>
          )}
          <p><span>Time to Complete Mortgage:</span><span>{results.yearsRemaining} years</span></p>
          {results.remainingBalance && (
            <p><span>Remaining Balance After Fixed Term:</span><span>{results.remainingBalance}</span></p>
          )}
          <PieChart interest={results.interest} principal={results.principal} />
        </div>
      )}
    </div>
  );
}

export default App;
