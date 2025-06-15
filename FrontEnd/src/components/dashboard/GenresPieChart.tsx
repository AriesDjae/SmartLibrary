import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { mockUserActivity } from '../../data/mockData';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const GenresPieChart: React.FC = () => {
  const { favoriteGenres } = mockUserActivity.readingStats;
  
  // Colors for the chart
  const backgroundColors = [
    'rgba(30, 58, 138, 0.8)',   // primary-900
    'rgba(55, 48, 163, 0.8)',   // primary-800
    'rgba(79, 70, 229, 0.8)',   // primary-600
    'rgba(99, 102, 241, 0.8)',  // primary-500
    'rgba(129, 140, 248, 0.8)', // primary-400
  ];
  
  const data = {
    labels: favoriteGenres.map(item => item.genre),
    datasets: [
      {
        data: favoriteGenres.map(item => item.count),
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} books (${percentage}%)`;
          }
        }
      }
    },
    cutout: '40%',
  };
  
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-lg mb-3">Favorite Genres</h3>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default GenresPieChart;