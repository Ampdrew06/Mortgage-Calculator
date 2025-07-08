import React, { useState } from "react";
import PieChart from "./PieChart";
import "./App.css";

const CreditCardCalculator = () => {
  const [balance, setBalance] = useState("");
  const [aprInput, setAprInput] = useState("");
  const [minPaymentInput, setMinPaymentInput] = useState("");
  const [overpaymentInput, setOverpaymentInput] = useState("");
  const [targetYearsInput, setTargetYearsInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultData, setResultData] = useState({
    payoffMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    initialMinPayment: 0,
  });

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate payoff allowing balance growth but tracking payoff or no payoff after max months
  const simulateWithPossibleBalanceGrowth = (
    principal,
    annualRate,
    floorPayment,
    minPercent,
    userMinPayment,
    overpayment,
    targetMonths
  ) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;

    // Use user min payment or calc first payment
    const initialMinPayment = userMinPayment && userMinPayment > 0
      ? userMinPayment
      : Math.max(floorPayment, balance * minPercent);

    // We'll track balance trend to detect infinite growth
    let previousBalances = [];

    while (months < 1000 && balance > 0) {
      // 1. Add interest
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      // 2. Calculate current min payment
      const currentMinPayment = Math.max(floorPayment, balance * minPercent);

      // 3. Payment for this month
      let payment =
        months === 0 && userMinPayment && userMinPayment > 0
          ? initialMinPayment + (overpayment > 0 ? overpayment : 0)
          : currentMinPayment + (overpayment > 0 ? overpayment : 0);

      balance -= payment;
      if (balance < 0) balance = 0;

      months++;

      // Store last 12 months balances to detect no reduction
      previousBalances.push(balance);
      if (previousBalances.length > 12) previousBalances.shift();

      // Check if balance hasn't decreased in last 12 months => no payoff
      if (
        previousBalances.length === 12 &&
        previousBalances.every((b) => b >= previousBalances[0])
      ) {
        // Balance is not decreasing
        break;
      }

      // Stop if target months reached
      if (targetMonths && months >= targetMonths) break;
    }

    return {
      canPayOff: balance <= 0,
      payoffMonths: months,
      totalInterest,
      totalPaid: principal + totalInterest,
      initialMinPayment,
      balanceRemaining: balance,
    };
  };

  const canSubmit = () => {
    const p = parseNumber(balance);
    const a = parseNumber(aprInput);
    const m = parseNumber(minPaymentInput);
    return p > 0 && (a > 0 || m > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResultsVisible(false);

    const principal = parseNumber(balance);
    let apr = parseNumber(aprInput);
    const userMinPayment = parseNumber(minPaymentInput);
    const overpayment = parseNumber(overpaymentInput) || 0;
    const targetYears = parseNumber(targetYearsInput);
    const targetMonths = targetYears && targetYears > 0 ? Math.round(targetYears * 12) : null;

    if (!principal || principal <= 0) {
      setErrorMsg("Please enter a valid Amount Outstanding.");
      return;
    }

    if (!apr || apr <= 0) apr = 25;

    const floorPayment = 25; // typical floor payment
    const minPercent = 0.015; // 1.5% of balance

    const sim = simulateWithPossibleBalanceGrowth(
      principal,
      apr,
      floorPayment,
      minPercent,
      userMinPayment,
      overpayment,
      targetMonths
    );

    if (!sim.canPayOff) {
      setErrorMsg(
        `Payment too low to pay off balance within 1000 months. Remaining balance after simulation: £${sim.balanceRemaining.toFixed(
          2
        )}`
      );
      return;
    }

    setResultData({
      payoffMonths: sim.payoffMonths,
      totalInterest: sim.totalInterest.toFixed(2),
      totalPaid: sim.totalPaid.toFixed(2),
      initialMinPayment: sim.initialMinPayment.toFixed(2),
    });

    setAprInput(apr.toFixed(2));
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance("");
    setAprInput("");
    setMinPaymentInput("");
    setOverpaymentInput("");
    setTargetYearsInput("");
    setErrorMsg("");
    setResultsVisible(false);
    setResultData({
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      initialMinPayment: 0,
    });
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
            <button
              type="button"
              className="clear-btn"
              onClick={() => setBalance("")}
            >
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="apr-input">APR (%)</label>
            <input
              id="apr-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter if known or leave blank for 25%"
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
            <button
              type="button"
              className="clear-btn"
              onClick={() => setAprInput("")}
            >
              Clear
            </button>
          </div>

          <div className="input-row">
            <label htmlFor="min-payment-input">Minimum Monthly Payment (£)</label>
            <input
              id="min-payment-input"
              type="text"
              inputMode="decimal"
              placeholder="Enter if known, or leave blank to auto-calc first payment"
              value={minPaymentInput}
              onChange={(e) => {
                setMinPaymentInput(e.target.value);
                setErrorMsg("");
                setResultsVisible(false);
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="clear-btn"
              onClick={() => setMinPaymentInput("")}
            >
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
            <button
              type="button"
              className="clear-btn"
              onClick={() => setOverpaymentInput("")}
            >
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
            <button
              type="button"
              className="clear-btn"
              onClick={() => setTargetYearsInput("")}
            >
              Clear
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "0.5rem" }}>
              {errorMsg}
            </p>
          )}

          <div
            className="button-row"
            style={{ display: "flex", gap: "0.5rem" }}
          >
            <button
              className="submit-btn ccc"
              type="submit"
              disabled={!canSubmit()}
              title={
                !canSubmit()
                  ? "Enter Amount Outstanding and APR or Min Payment"
                  : "Submit"
              }
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

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>APR Used:</strong> {aprInput}%
            </p>
            <p>
              <strong>Initial Minimum Payment:</strong> £
              {resultData.initialMinPayment}
            </p>
            <p>
              <strong>Estimated Payoff Time:</strong>{" "}
              {(resultData.payoffMonths / 12).toFixed(1)} years
            </p>
            <p>
              <strong>Total Interest Paid:</strong> £
              {parseFloat(resultData.totalInterest).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>Total Paid:</strong> £
              {parseFloat(resultData.totalPaid).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>

            <PieChart
              interest={parseFloat(resultData.totalInterest)}
              principal={parseFloat(balance.replace(/,/g, ""))}
              colors={["#ff4d4f", "#4aa4e3"]}
            />

            <p
              className="chart-labels"
              style={{
                marginTop: "0.8rem",
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
              }}
            >
              <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                Interest Paid
              </span>
              <span style={{ color: "#4aa4e3", fontWeight: "bold" }}>
                Principal Paid
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreditCardCalculator;
