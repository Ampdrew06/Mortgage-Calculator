import React, { useState } from 'react';
import PieChart from './PieChart'; // shared PieChart component
import './App.css';

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [overpayment, setOverpayment] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [aprIsEstimated, setAprIsEstimated] = useState(false);

  const parseInput = (value) => {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? null : num;
  };

  const calculatePayoff = (balance, monthlyRate, monthlyPayment) => {
    let remaining = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 1000;

    while (remaining > 0 && months < maxMonths) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principalPayment = monthlyPayment - interest;

      if (principalPayment <= 0) {
        return null; // Can't pay off with this payment
      }

      remaining -= principalPayment;
      months++;
    }

    if (months === maxMonths) return null;

    return { months, totalInterest };
  };

  const estimateAPR = (balance, minPayment) => {
    if (minPayment <= 0 || balance <= 0) return null;

    let low = 0;
    let high = 1; // 100% monthly upper bound
    let mid;

    for (let i = 0; i < 30; i++) {
      mid = (low + high) / 2;
      const result = calculatePayoff(balance, mid, minPayment);

      if (!result) {
        low = mid;
        continue;
      }

      if (result.months > 240) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return mid * 12 * 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setAprIsEstimated(false);

    const bal = parseInput(balance);
    if (bal === null || bal <= 0) {
      setError('Please enter a valid positive amount outstanding.');
      return;
    }

    let annualAPR = parseInput(apr);
    let minPay = parseInput(minPayment);
    const overpay = parseInput(overpayment) || 0;

    if (!annualAPR && !minPay) {
      setError('Please enter either APR or Minimum Monthly Payment.');
      return;
    }

    // Estimate APR if missing
    if (!annualAPR && minPay) {
      const estimatedAPR = estimateAPR(bal, minPay);
      if (!estimatedAPR) {
        setError('Unable to estimate APR from given inputs.');
        return;
      }
      annualAPR = estimatedAPR;
      setApr(estimatedAPR.toFixed(2));
      setAprIsEstimated(true);
    }

    const monthlyRate = annualAPR / 100 / 12;

    let paymentToUse = minPay || 0;
    if (overpay > 0) paymentToUse += overpay;

    if (!minPay) {
      // Estimate minimum payment if missing: interest + 1% balance + overpay
      paymentToUse = bal * monthlyRate + bal * 0.01 + overpay;
    }

    const payoff = calculatePayoff(bal, monthlyRate, paymentToUse);

    if (!payoff) {
      setError('The payment is too low to ever pay off the balance.');
      return;
    }

    const { months, totalInterest } = payoff;

    setResults({
      payoffTimeMonths: months,
      payoffTimeYears: (months / 12).toFixed(1),
      totalInterest: totalInterest.toFixed(2),
      totalPaid: (bal + totalInterest).toFixed(2),
      usedAPR: annualAPR.toFixed(2),
      monthlyPayment: paymentToUse.toFixed(2),
    });
  };

  return (
    <div className="container">
      <h2>Credit Card Calculator</h2>

      <form onSubmit={handleSubmit} autoComplete="off" spellCheck="false">
        <div className="input-row">
          <label>Amount Outstanding (£)*</label>
          <input
            type="text"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 1500"
            required
          />
        </div>

        <div className="input-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label style={{ marginBottom: '0.25rem' }}>APR (%)</label>
          <input
            type="text"
            inputMode="decimal"
            value={apr}
            onChange={(e) => {
              setApr(e.target.value);
              setAprIsEstimated(false);
            }}
            placeholder="e.g. 18"
          />
          {aprIsEstimated && (
            <small style={{ color: '#f39c12', fontStyle: 'italic', marginTop: '0.25rem' }}>
              * APR estimated from minimum payment
            </small>
          )}
        </div>

        <div className="input-row">
          <label>Minimum Monthly Payment (£)</label>
          <input
            type="text"
            inputMode="decimal"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value)}
            placeholder="e.g. 50"
          />
        </div>

        <div className="input-row">
          <label>Optional Overpayment (£)</label>
          <input
            type="text"
            inputMode="decimal"
            value={overpayment}
            onChange={(e) => setOverpayment(e.target.value)}
            placeholder="e.g. 20"
          />
        </div>

        <button type="submit" className="submit-btn ccc" style={{ marginTop: '1rem' }}>
          Calculate
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {results && (
        <div className="results-box" style={{ marginTop: '1rem' }}>
          <p>
            <strong>Used APR (%):</strong> {results.usedAPR}
          </p>
          <p>
            <strong>Monthly Payment (£):</strong> {results.monthlyPayment}
          </p>
          <p>
            <strong>Time to Pay Off:</strong> {results.payoffTimeMonths} months (~{results.payoffTimeYears} years)
          </p>
          <p>
            <strong>Total Interest Paid (£):</strong> {results.totalInterest}
          </p>
          <p>
            <strong>Total Amount Paid (£):</strong> {results.totalPaid}
          </p>

          <PieChart
            interest={parseFloat(results.totalInterest)}
            principal={parseFloat(balance.replace(/,/g, ''))}
          />
        </div>
      )}
    </div>
  );
};

export default CreditCardCalculator;
