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
  const [userSimData, setUserSimData] = useState(null);
  const [suggestedSimData, setSuggestedSimData] = useState(null);

  const parseNumber = (val) => {
    if (!val) return NaN;
    const cleaned = val.toString().replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  // Improved simulation with max 600 months (50 years) and detect growing debt if balance increases 3 months in a row
  const simulatePayoff = (
    principal,
    annualRate,
    floorPayment,
    minPercent,
    paymentOverride,
    overpayment,
    targetMonths
  ) => {
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    let months = 0;
    let totalInterest = 0;

    const initialMinPayment =
      paymentOverride && paymentOverride > 0
        ? paymentOverride
        : Math.max(floorPayment, balance * minPercent);

    const initialBalance = balance;

    let previousBalance = balance;
    let growingDebtCount = 0;

    while (months < 600 && balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;

      const currentMinPayment = Math.max(floorPayment, balance * minPercent);

      let payment =
        months === 0 && paymentOverride && paymentOverride > 0
          ? initialMinPayment + (overpayment > 0 ? overpayment : 0)
          : currentMinPayment + (overpayment > 0 ? overpayment : 0);

      balance -= payment;
      if (balance < 0) balance = 0;

      months++;

      if (targetMonths && months >= targetMonths) break;

      // Check if debt is growing
      if (balance > previousBalance) {
        growingDebtCount++;
        if (growingDebtCount >= 3) break; // stop simulation if balance grows 3 consecutive months
      } else {
        growingDebtCount = 0;
      }
      previousBalance = balance;
    }

    const growingDebt = balance > initialBalance;

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
    setResultsVisible(false);
    setUserSimData(null);
    setSuggestedSimData(null);

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
    const minPercent = 0.015; // 1.5% min payment

    // Monthly interest for warning and suggestion
    const monthlyInterest = principal * (apr / 100) / 12;

    // Auto-calc min payment if user did not enter it
    let paymentOverride = userMinPayment;
    if (!paymentOverride || paymentOverride <= 0) {
      paymentOverride = Math.max(floorPayment, principal * minPercent);
      setMinPaymentInput(paymentOverride.toFixed(2));
    }

    // Simulate with user payment (or auto-calc)
    const simUser = simulatePayoff(
      principal,
      apr,
      floorPayment,
      minPercent,
      paymentOverride,
      overpayment,
      targetMonths
    );

    // Suggested payment to avoid debt growth (1% above monthly interest)
    const suggestedPayment = monthlyInterest * 1.01;
    const simSuggested = simulatePayoff(
      principal,
      apr,
      floorPayment,
      minPercent,
      suggestedPayment,
      overpayment,
      targetMonths
    );

    if (simUser.growingDebt) {
      // Fix display for NaN min payment
      const enteredPaymentDisplay = !isNaN(userMinPayment) ? userMinPayment.toFixed(2) : "not entered";
      const suggestedPaymentDisplay = simSuggested.initialMinPayment.toFixed(2);
      const payoffYearsUser = simUser.payoffMonths ? simUser.payoffMonths / 12 : 0;
      const payoffYearsSuggested = simSuggested.payoffMonths / 12;

      setErrorMsg(
        `Your entered minimum payment (£${enteredPaymentDisplay}) is less than the monthly interest (£${monthlyInterest.toFixed(
          2
        )}). Paying only this amount will increase your debt over time.\n\n` +
          `Estimated payoff time with your payment: >${payoffYearsUser > 80 ? 80 : payoffYearsUser.toFixed(1)} years (debt grows).\n` +
          `Suggested minimum payment to pay off in ${payoffYearsSuggested.toFixed(1)} years: £${suggestedPaymentDisplay}`
      );
      setUserSimData(simUser);
      setSuggestedSimData(simSuggested);
      setResultsVisible(true);
      return;
    }

    // No growing debt — just normal results with user payment
    setUserSimData(simUser);
    setSuggestedSimData(null);
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
    setUserSimData(null);
    setSuggestedSimData(null);
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
            <p style={{ color: "red", fontWeight: "bold", marginTop: "0.5rem", whiteSpace: "pre-line" }}>
              {errorMsg}
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

        {resultsVisible && (
          <div className="results-box">
            <p>
              <strong>APR Used:</strong> {aprInput ? aprInput : "25"}%
            </p>

            <p>
              <strong>Initial Minimum Payment:</strong> £
              {userSimData?.initialMinPayment
                ? userSimData.initialMinPayment.toFixed(2)
                : "N/A"}
            </p>

            <p>
              <strong>Estimated Payoff Time with your payment:</strong>{" "}
              {userSimData
                ? (userSimData.payoffMonths / 12).toFixed(1) + " years"
                : "N/A"}
            </p>

            {suggestedSimData && (
              <>
                <p>
                  <strong>Suggested Minimum Payment (to avoid debt growth):</strong> £
                  {suggestedSimData.initialMinPayment.toFixed(2)}
                </p>

                <p>
                  <strong>Estimated Payoff Time with suggested payment:</strong>{" "}
                  {(suggestedSimData.payoffMonths / 12).toFixed(1)} years
                </p>
              </>
            )}

            <p>
              <strong>Total Interest Paid:</strong> £
              {userSimData
                ? parseFloat(userSimData.totalInterest).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                : "N/A"}
            </p>
            <p>
              <strong>Total Paid:</strong> £
              {userSimData
                ? parseFloat(userSimData.totalPaid).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                : "N/A"}
            </p>

            {userSimData && (
              <PieChart
                interest={parseFloat(userSimData.totalInterest)}
                principal={parseFloat(balance.replace(/,/g, ""))}
                colors={["#ff4d4f", "#4aa4e3"]}
              />
            )}

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
