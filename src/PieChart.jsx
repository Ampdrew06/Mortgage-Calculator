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
        backgroundColor: ['#f44336', '#4caf50'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="pie-wrapper" role="img" aria-label="Pie chart showing interest versus principal paid">
      <Pie data={data} options={options} />
      <div className="pie-labels" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <span style={{ color: '#f44336' }}>Red: Interest</span>
        <span style={{ color: '#4caf50' }}>Green: Principal</span>
      </div>
    </div>
  );
};

export default PieChart;
