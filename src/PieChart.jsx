import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ interest, principal }) {
  const data = {
    labels: ['Interest Paid', 'Principal Paid'],
    datasets: [
      {
        label: 'Repayment Breakdown',
        data: [interest, principal],
        backgroundColor: ['#ff4d4f', '#4caf50'],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          color: '#333',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div className="pie-chart-container">
      <Pie data={data} options={options} />
    </div>
  );
}

export default PieChart;
