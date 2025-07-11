import React, { useState } from "react";
import PieChart from "./PieChart";
import "./App.css";

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState("");
  const [aprInput, setAprInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [simData, setSimData] = useState(null);

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate month-by-month payoff with realistic min payment logic:
  // monthly min payment = max(10, balance * 0.015 + interest)
  const simulatePayoff = (principal, annualRate) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;

    const fixedFloor = 10; // £10 floor
    const minPercent = 0.015; // 1.5% of balance

    let lastBalance = balance;
    let consecutiveGrowth = 0;

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      const minPayment = Math.max(fixedFloor, balance * minPercent);

      if (minPayment <= 0) break;

      balance -= minPayment;
      if (balance < 0) balance = 0;

      months++;

      // Detect growing debt 3 months in a row
      if (balance > lastBalance) {
        consecutiveGrowth++;
        if (consecutiveGrowth >= 3) break;
      } else {
        consecutiveGrowth = 0;
      }
      lastBalance = balance;
    }

    const debtGrowing = balance > principal;

    return {
      canPayOff: !debtGrowing && balance <= 0,
      debtGrowing,
      payoffMonths: months,
      totalInterest,
      totalPaid: principal + totalInterest,
      firstMonthPayment: Math.max(fixedFloor, principal * minPercent),
    };
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    return p > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResultsVisible(false);
    setSimData(null);

    const principal = parseNumber(balance);
    if (!principal || principal <= 0) {
      setErrorMsg("Please enter a valid Amount Outstanding.");
      return;
    }

    let apr = parseNumber(aprInput);
    if (!apr || apr <= 0) apr = 25;

    const sim = simulatePayoff(principal, apr);

    if (sim.debtGrowing) {
      setErrorMsg(
        `Warning: Minimum payments may be too low to reduce your debt. Balance could grow over time.`
      );
    }

    setSimData({
      ...sim,
      usedAPR: apr,
    });
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance("");
    setAprInput("");
    setErrorMsg("");
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
                setResultsVisible(false);
              }}
              autoComplete="off"
            />
            <button type="button" className="clear-btn" onClick={() => setAprInput("")}>
              Clear
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "0.5rem" }}>{errorMsg}</p>
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
              <strong>First Month Minimum Payment:</strong> £{simData.firstMonthPayment.toFixed(2)}
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
