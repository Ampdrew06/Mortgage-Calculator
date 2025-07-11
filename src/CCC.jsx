import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";
import "./App.css";

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState("");
  const [aprInput, setAprInput] = useState("");
  const [targetYearsInput, setTargetYearsInput] = useState("");
  const [overpaymentInput, setOverpaymentInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [simData, setSimData] = useState(null);

  // Helper to parse input strings to floats safely
  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate payoff with given parameters
  const simulatePayoff = (principal, annualRate, monthlyPayment, overpayment, targetMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    const minFloor = 15; // fixed minimum payment floor
    const percentOfBalance = 0.025; // 2.5% of balance

    let lastBalance = balance;
    let consecutiveGrowthMonths = 0;

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      // Calculate minimum safe payment for this month (hidden from user)
      const safeMinPayment = Math.max(minFloor, interest + balance * percentOfBalance);

      let paymentThisMonth = monthlyPayment + overpayment;

      // Prevent payments below safe minimum leading to growing debt warning
      if (paymentThisMonth < safeMinPayment) {
        // Here we allow user to proceed but can warn in UI
      }

      if (paymentThisMonth <= 0) break;

      balance -= paymentThisMonth;
      if (balance < 0) balance = 0;

      months++;

      if (targetMonths && months >= targetMonths) break;

      // Detect if balance grows for 3 consecutive months → break loop
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

  // Calculate monthly payment needed for target payoff using amortization formula
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
    const a = parseNumber(aprInput);
    return p > 0 && a > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setWarningMsg("");
    setResultsVisible(false);
    setSimData(null);

    const principal = parseNumber(balance);
    let apr = parseNumber(aprInput);
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

    // Calculate monthly payment: if target given, calculate required payment; else use safe minimum
    let monthlyPayment = targetMonths
      ? calculateTargetPayment(principal, apr, targetMonths)
      : Math.max(
          15,
          principal * (apr / 100 / 12 + 0.025)
        ); // min floor or interest + 2.5%

    const sim = simulatePayoff(principal, apr, monthlyPayment, overpayment, targetMonths);

    // Warn if user payment less than safe minimum (only if no target)
    if (!targetMonths && monthlyPayment < sim.safeMinPayment) {
      setWarningMsg(
        `Warning: Calculated monthly payment (£${monthlyPayment.toFixed(
          2
        )}) may be too low to reduce debt due to interest and fees. Debt could grow over time.`
      );
    }

    setSimData({
      ...sim,
      usedAPR: apr,
      monthlyPayment,
    });

    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance("");
    setAprInput("");
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
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
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
              title={!canSubmit() ? "Enter Amount Outstanding and APR" : "Submit"}
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
              <strong>Initial Monthly Payment:</strong> £{simData.monthlyPayment.toFixed(2)}
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
