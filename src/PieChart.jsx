import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';

ChartJS.register(ArcElement);

const PieChart = ({ interest, principal }) => {
  const data = {
    labels: ['Interest Paid', 'Principal Paid'],
    datasets: [
      {
        data: [interest, principal],
        backgroundColor: ['#ff4d4f', '#4caf50'], // Red and Green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // fully disable Chart.js legend
      },
      tooltip: {
        enabled: false, // optional: disables tooltip popups
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
