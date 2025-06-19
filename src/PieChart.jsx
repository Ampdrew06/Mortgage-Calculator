import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ interest, principal }) {
  const chartRef = useRef();

  const data = {
    labels: ['Interest', 'Principal'],
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
        display: false, // Disable Chart.js legend
        position: 'bottom'
      }
    }
  };

  // 🧼 Extra cleanup: forcibly hide any Chart.js canvas-based legends
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && chart.canvas) {
      const legends = chart.canvas.parentNode?.querySelectorAll('ul');
      legends?.forEach((el) => el.remove());
    }
  }, []);

  return (
    <div className="pie-chart-container">
      <Pie ref={chartRef} data={data} options={options} />
      <div className="pie-chart-legend">
        <span><span className="dot red"></span>Interest Paid</span>
        <span><span className="dot green"></span>Principal Paid</span>
      </div>
    </div>
  );
}

export default PieChart;
