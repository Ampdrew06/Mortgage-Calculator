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

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <Pie data={data} />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <span style={{ color: '#f44336', fontWeight: 'bold' }}>Red:</span> Interest being paid &nbsp;|&nbsp;
        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Green:</span> Principal being paid
      </div>
    </div>
  );
};

export default PieChart;
