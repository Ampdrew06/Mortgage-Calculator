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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
    },
  };

 return (
  <div
    style={{ maxWidth: '180px', height: '180px', margin: '2rem auto' }}
    role="img"
    aria-label="Pie chart showing interest versus principal paid"
  >
    <Pie data={data} options={options} />
    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.95rem' }}>
      <span style={{ color: '#f44336', fontWeight: 'bold' }}>Red:</span> Interest being paid&nbsp;|&nbsp;
      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Green:</span> Principal being paid
    </div>
  </div>
);


export default PieChart;
