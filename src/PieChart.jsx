import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ interest, principal }) {
  const data = {
    labels: ['Interest', 'Principal'],
    datasets: [
      {
        label: 'Repayment Breakdown',
        data: [interest, principal],
        backgroundColor: ['#ff4d4f', '#4caf50'], // Red and green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // ✅ disables Chart.js's built-in legend
      },
    },
  };

  return (
    <div className="pie-chart-container">
      <Pie data={data} options={options} />
      <div className="pie-chart-legend">
        <span><span className="dot red"></span>Interest Paid</span>
        <span><span className="dot green"></span>Principal Paid</span>
      </div>
    </div>
  );
}

export default PieChart;
