import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ interest, principal }) => {
  const data = {
    labels: ['Interest', 'Principal'],
    datasets: [
      {
        data: [interest, principal],
        backgroundColor: ['#ff6384', '#36a2eb'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="pie-chart-container">
      <Pie data={data} />
      <div className="pie-chart-legend">
        <span className="dot red" /> Interest Paid
        <span className="spacer" />
        <span className="dot green" /> Principal Paid
      </div>
    </div>
  );
};

export default PieChart;
