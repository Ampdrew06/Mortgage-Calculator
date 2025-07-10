import React, { useState, useEffect } from "react";
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

  // Auto-set APR to 25% if balance entered and APR is blank
  useEffect(() => {
    if (balance && !aprInput.trim()) {
      setAprInput("25.00");
    }
  }, [balance, aprInput]);

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  const simulatePayoff = (
    principal,
    annualRate,
    userMinPayment,
    overpayment,
    targetMonths
  ) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;

    let lastBalance = balance;
    let consecutiveGrowthMonths = 0;

    // Calculate initial minimum payment with softened formula
    const firstInterest = balance * monthlyRate;
    const floorPayment = 20; // lowered floor from 25
    const percentOfBalance = 0.01;
    const minPaymentFirstMonth = Math.max(
      firstInterest + balance * percentOfBalance,
      floorPayment,
      1.5 * firstInterest + 3 // softened multiplier/addition
    );

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      const minPayment = Math.max(
        interest + balance * percentOfBalance,
        floorPayment,
        1.5 * interest + 3
      );

      let paymentThisMonth;
      if (months === 0) {
        if (userMinPayment && userMinPayment >= minPayment) {
          paymentThisMonth = userMinPayment + (overpayment || 0);
        } else {
          paymentThisMonth = minPayment + (overpayment || 0);
        }
      } else {
        paymentThisMonth = minPayment + (overpayment || 0);
      }

      if (paymentThisMonth < 0) paymentThisMonth = 0;

      balance -= paymentThisMonth;
      if (balance < 0) balance = 0;

      months++;

      if (targetMonths && months >= targetMonths) break;

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
      initialMinPayment: minPaymentFirstMonth,
      balanceRemaining: balance,
    };
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
    const userMinPayment = parseNumber(minPaymentInput);
    const overpayment = parseNumber(overpaymentInput) || 0;
    const targetYears = parseNumber(targetYearsInput);
    const targetMonths = targetYears && targetYears > 0 ? Math.round(targetYears * 12) : null;

    if (!principal || principal <= 0) {
      setErrorMsg("Please enter a valid Amount Outstanding.");
      return;
    }

    if (!apr || apr <= 0) {
      apr = 25;
      setAprInput("25.00");
    }

    const sim = simulatePayoff(principal, apr, userMinPayment, overpayment, targetMonths);

    if (
      userMinPayment &&
      userMinPayment > 0 &&
      userMinPayment < sim.initialMinPayment - 0.01
    ) {
      setWarningMsg(
        `Your entered minimum payment (£${userMinPayment.toFixed(
          2
        )}) is less than the calculated minimum payment needed (£${sim.initialMinPayment.toFixed(
          2
        )}). This may lead to increasing debt over time.`
      );
    }

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
              disabled={!balance || !aprInput}
              title={
                !balance || !aprInput
                  ? "Enter Amount Outstanding and APR"
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
