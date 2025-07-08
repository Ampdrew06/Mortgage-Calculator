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
  const [simData, setSimData] = useState(null);
  const [warningMsg, setWarningMsg] = useState("");

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Simulate payoff with realistic min payment calc
  const simulatePayoff = (
    principal,
    annualRate,
    floorPayment,
    percentPayment,
    userPayment,
    overpayment,
    targetMonths
  ) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    let lastBalance = balance;
    let consecutiveGrowthMonths = 0;

    // Determine initial min payment: userPayment overridden if below real min payment
    const initialInterest = balance * monthlyRate;
    const realMinPaymentInitial = Math.max(floorPayment, balance * percentPayment + initialInterest);
    let paymentUsed =
      userPayment && userPayment > realMinPaymentInitial
        ? userPayment
        : realMinPaymentInitial;

    // For initial MMP display
    const initialMinPayment = paymentUsed;

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      const realMinPayment = Math.max(floorPayment, balance * percentPayment + interest);
      // Use userPayment only for first payment, then simulate payments as realMinPayment + overpayment
      let paymentThisMonth =
        months === 0
          ? paymentUsed + (overpayment > 0 ? overpayment : 0)
          : realMinPayment + (overpayment > 0 ? overpayment : 0);

      if (paymentThisMonth < 0) paymentThisMonth = 0;

      balance -= paymentThisMonth;
      if (balance < 0) balance = 0;

      months++;

      // Target payoff logic
      if (targetMonths && months >= targetMonths) break;

      // Detect growing debt (balance increasing 3 months in a row)
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
    setWarningMsg("");
    setResultsVisible(false);
    setSimData(null);

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

    // Default APR to 25% if blank or invalid
    if (!apr || apr <= 0) {
      apr = 25;
      setAprInput("25.00");
    }

    const floorPayment = 25; // floor minimum payment £25
    const percentPayment = 0.015; // 1.5% typical min payment percent of balance

    const monthlyInterest = principal * (apr / 100) / 12;

    // Simulate payoff with current inputs and logic
    const sim = simulatePayoff(
      principal,
      apr,
      floorPayment,
      percentPayment,
      userMinPayment,
      overpayment,
      targetMonths
    );

    // Warning if user min payment less than real min payment on first month
    if (
      userMinPayment &&
      userMinPayment > 0 &&
      userMinPayment < sim.initialMinPayment - 0.01 // small tolerance
    ) {
      setWarningMsg(
        `Your entered minimum payment (£${userMinPayment.toFixed(
          2
        )}) is less than the calculated minimum payment needed (£${sim.initialMinPayment.toFixed(
          2
        )}). This may lead to increasing debt over time.`
      );
    } else {
      setWarningMsg("");
    }

    // Show results
    setSimData(sim);
    setResultsVisible(true);
  };

  const resetAll = () => {
    setBalance("");
    setAprInput("");
    setMinPaymentInput("");
    setOverpaymentInput("");
    setTargetYearsInput("");
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
            <p style={{ color: "orange", fontWeight: "bold", marginTop: "0.5rem", whiteSpace: "pre-line" }}>
              {warningMsg}
            </p>
          )}

          <div className="button-row" style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="submit-btn ccc"
              type="submit"
              disabled={!balance || (!aprInput && !minPaymentInput)}
              title={
                !balance || (!aprInput && !minPaymentInput)
                  ? "Enter Amount Outstanding and APR or Minimum Payment"
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

        {resultsVisible && simData && (
          <div className="results-box">
            <p>
              <strong>APR Used:</strong> {aprInput ? aprInput : "25"}%
            </p>

            <p>
              <strong>Initial Minimum Payment:</strong> £{simData.initialMinPayment.toFixed(2)}
            </p>

            <p>
              <strong>Estimated Payoff Time with your payment:</strong>{" "}
              {(simData.payoffMonths / 12).toFixed(1)} years
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
