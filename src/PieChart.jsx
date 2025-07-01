import React, { useRef, useEffect } from 'react'; 
import Chart from 'chart.js/auto';

const PieChart = ({ interest, principal }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Interest', 'Principal'],
        datasets: [
          {
            data: [interest, principal],
            backgroundColor: ['#ff4d4f', '#4caf50'], // red / green
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // disable built-in legend
          },
        },
      },
    });
  }, [interest, principal]);

  return (
    <div className="pie-chart-container">
      <canvas ref={chartRef} width={180} height={180} />
      <div className="pie-chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f', fontWeight: 'bold' }}>
          <span className="dot red" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff4d4f', display: 'inline-block', marginRight: '6px' }} />
          Interest Paid
        </span>
        <span style={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontWeight: 'bold' }}>
          <span className="dot green" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50', display: 'inline-block', marginRight: '6px' }} />
          Principal Paid
        </span>
      </div>
    </div>
  );
};

export default PieChart;
