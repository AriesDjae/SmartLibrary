import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReadingChart: React.FC = () => {
  // Mock data for the reading chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Reading Time (minutes)',
        data: [30, 45, 25, 60, 35, 90, 70],
        backgroundColor: 'rgba(30, 58, 138, 0.8)',
      },
      {
        label: 'Pages Read',
        data: [15, 25, 12, 30, 18, 45, 35],
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-lg mb-4">Weekly Reading Activity</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ReadingChart;