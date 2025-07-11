import React, { useState } from "react";
import PieChart from "./PieChart";
import "./App.css";

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState("");
  const [aprInput, setAprInput] = useState("");
  const [minPaymentInput, setMinPaymentInput] = useState("");
  const [targetYearsInput, setTargetYearsInput] = useState("");
  const [overpaymentInput, setOverpaymentInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [simData, setSimData] = useState(null);

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate payoff month-by-month
  const simulatePayoff = (principal, annualRate, monthlyPayment, overpayment, targetMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    const minFloor = 10; // Lower floor closer to typical card min payment
    const percentOfBalance = 0.015; // 1.5% of balance

    let lastBalance = balance;
    let consecutiveGrowthMonths = 0;

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      // Safe minimum payment for warning only
      const safeMinPayment = Math.max(minFloor, interest + balance * percentOfBalance);

      let paymentThisMonth = monthlyPayment + overpayment;

      if (paymentThisMonth < safeMinPayment) {
        // Allow but warn
      }

      if (paymentThisMonth <= 0) break;

      balance -= paymentThisMonth;
      if (balance < 0) balance = 0;

      months++;

      if (targetMonths && months >= targetMonths) break;

      // Detect balance growth 3 months in a row → break
      if (balance > lastBalance) {
        consecutiveGrowthMonths++;
        if (consecutiveGrowthMonths >= 3) break;
      } else {
        consecutiveGrowthMonths = 0;
      }
      lastBalance = balance;
    }

    const growingDebt = balance > principal;

    return {
      canPayOff: !growingDebt && balance <= 0,
      growingDebt,
      payoffMonths: months,
      totalInterest,
      totalPaid: principal + totalInterest,
      finalBalance: balance,
      safeMinPayment: Math.max(minFloor, principal * percentOfBalance + principal * monthlyRate),
    };
  };

  // Calculate monthly payment for target payoff period
  const calculateTargetPayment = (principal, annualRate, months) => {
    if (months <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return principal * (numerator / denominator);
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    return p > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setWarningMsg("");
    setResultsVisible(false);
    setSimData(null);

    const principal = parseNumber(balance);
    let apr = parseNumber(aprInput);
    const minPaymentUser = parseNumber(minPaymentInput);
    const targetYears = parseNumber(targetYearsInput);
    const targetMonths = targetYears && targetYears > 0 ? Math.round(targetYears * 12) : null;
    const overpayment = parseNumber(overpaymentInput) || 0;

    if (!principal || principal <= 0) {
      setErrorMsg("Please enter a valid Amount Outstanding.");
      return;
    }

    if (!apr || apr <= 0) {
      apr = 25; // default APR assumption
      setAprInput("25");
    }

    // Calculate minimum payment: user input overrides auto-calculated (safe) payment
    let autoMinPayment = Math.max(
      10,
      principal * (apr / 100 / 12 + 0.015)
    );

    let monthlyPayment = minPaymentUser && minPaymentUser > 0 ? minPaymentUser : autoMinPayment;

    // If target payoff given, calculate required monthly payment to meet target
    if (targetMonths) {
      monthlyPayment = calculateTargetPayment(principal, apr, targetMonths) + overpayment;
    } else {
      // Add overpayment to monthly payment if no target
      monthlyPayment += overpayment;
    }

    if (monthlyPayment <= 0) {
      setErrorMsg("Monthly payment must be greater than zero.");
      return;
    }

    const sim = simulatePayoff(principal, apr, monthlyPayment, 0, targetMonths);

    // Warn if monthly payment less than safe minimum and no target
    if (!targetMonths && monthlyPayment < autoMinPayment) {
      setWarningMsg(
        `Warning: Your monthly payment (£${monthlyPayment.toFixed(
          2
        )}) may be too low to reduce your balance over time at this APR. Debt could grow.`
      );
    }

    setSimData({
      ...sim,
      usedAPR: apr,
      monthlyPayment,
      autoMinPayment,
    });

    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance("");
    setAprInput("");
    setMinPaymentInput("");
    setTargetYearsInput("");
    setOverpaymentInput("");
    setErrorMsg("");
    setWarningMsg("");
    setResultsVisible(false);
    setSimData(null);
  };

  return (
    <>
      <div className="header-box">
        <h2>Credit Card Calculator</h2>
      </div>

      <div className="container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="input-row">
            <label htmlFor="balance-input">Amount Outstanding (£)</label>
            <input
              id="balance-input"
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={(e) => {
                setBalance(e.target.value);
                setErrorMsg("");
                setWarningMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="e.g. 5000"
            />
            <button type="button" className="clear-btn" onClick={() => setBalance("")}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter APR if known or leave blank for 25%"
              value={aprInput}
              onChange={(e) => {
                setAprInput(e.target.value);
                setErrorMsg("");
                setWarningMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setAprInput("")}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="min-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="min-payment-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter if known, or leave blank to auto-calc"
              value={minPaymentInput}
              onChange={(e) => {
                setMinPaymentInput(e.target.value);
                setErrorMsg("");
                setWarningMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setMinPaymentInput("")}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="overpayment-input">Overpayment (£, optional)</label>
            <input
              id="overpayment-input"
              type="text"
              inputMode="decimal"
              placeholder="Extra monthly payment"
              value={overpaymentInput}
              onChange={(e) => {
                setOverpaymentInput(e.target.value);
                setErrorMsg("");
                setWarningMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setOverpaymentInput("")}>
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="target-years-input">Target Payoff Time (Years, optional)</label>
            <input
              id="target-years-input"
              type="text"
              inputMode="decimal"
              placeholder="Leave blank if no target"
              value={targetYearsInput}
              onChange={(e) => {
                setTargetYearsInput(e.target.value);
                setErrorMsg("");
                setWarningMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="clear-btn" onClick={() => setTargetYearsInput("")}>
              Clear
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "0.5rem" }}>{errorMsg}</p>
          )}
          {warningMsg && (
            <p
              style={{
                color: "orange",
                fontWeight: "bold",
                marginTop: "0.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {warningMsg}
            </p>
          )}

          <div className="button-row" style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="submit-btn ccc"
              type="submit"
              disabled={!canSubmit()}
              title={!canSubmit() ? "Enter Amount Outstanding" : "Submit"}
              style={{ flex: 1 }}
            >
              Submit
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={resetAll}
              style={{ flex: 1 }}
            >
              Reset All
            </button>
          </div>
        </form>

        {resultsVisible && simData && (
          <div className="results-box">
            <p>
              <strong>APR Used:</strong> {simData.usedAPR.toFixed(2)}%
            </p>
            <p>
              <strong>Monthly Payment Used:</strong> £{simData.monthlyPayment.toFixed(2)}
            </p>
            <p>
              <strong>Estimated Payoff Time:</strong> {(simData.payoffMonths / 12).toFixed(1)} years
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £
              {simData.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p>
              <strong>Total Paid:</strong> £
              {simData.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>

            <PieChart
              interest={simData.totalInterest}
              principal={parseFloat(balance.replace(/,/g, ""))}
              colors={["#ff4d4f", "#4aa4e3"]}
            />

            <p
              className="chart-labels"
              style={{ marginTop: "0.8rem", display: "flex", justifyContent: "center", gap: "2rem" }}
            >
              <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>Interest Paid</span>
              <span style={{ color: "#4aa4e3", fontWeight: "bold" }}>Principal Paid</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
