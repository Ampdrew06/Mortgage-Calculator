import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ interest, principal }) => {
  const data = {
    labels: ['Interest Paid', 'Principal Paid'],
    datasets: [
      {
        data: [interest, principal],
        backgroundColor: ['#ff4d4f', '#4caf50'], // red and green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // DISABLE built-in legend
        labels: {
          generateLabels: () => [], // failsafe to suppress
        },
      },
      tooltip: {
        enabled: false, // optional
      },
    },
  };

  return (
    <div className="pie-chart-container">
      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
        <Pie data={data} options={options} />
      </div>
      <div className="pie-chart-legend">
        <span><span className="dot red" />Interest Paid</span>
        <span><span className="dot green" />Principal Paid</span>
      </div>
    </div>
  );
};

export default PieChart;
