const simulatePayoff = (principal, monthlyRate, payment) => {
  let balance = principal;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 1000;

  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const principalPaid = payment - interest;
    if (principalPaid <= 0) {
      // Payment too low to ever pay off
      return { months: -1, totalInterest: 0 };
    }
    balance -= principalPaid;
    totalInterest += interest;
    months++;
  }
  if (months === maxMonths) {
    return { months: -1, totalInterest: 0 }; // Didn't pay off in reasonable time
  }
  return { months, totalInterest };
};

const estimateAPR = (principal, payment) => {
  let low = 0.0;
  let high = 0.05; // 5% monthly = 60% APR max - more realistic
  let mid = 0.0;
  let resultMonths = 0;
  let resultInterest = 0;

  // Quick check: is payment <= principal? (lowest possible interest)
  if (payment <= principal * low) return { apr: -1 };

  for (let i = 0; i < 50; i++) {
    mid = (low + high) / 2;
    const sim = simulatePayoff(principal, mid, payment);
    if (sim.months === -1) {
      low = mid;
    } else {
      high = mid;
      resultMonths = sim.months;
      resultInterest = sim.totalInterest;
    }
  }

  return {
    apr: mid * 12 * 100,
    months: resultMonths,
    totalInterest: resultInterest,
    totalPaid: principal + resultInterest,
  };
};
