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
import { ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyStat {
  day: string;
  readingTime: number;
  pagesRead: number;
}

interface ReadingChartProps {
  weeklyStats: WeeklyStat[];
  loadingWeeklyStats: boolean;
}

function getCurrentWeekRangeLabel() {
  const today = new Date(); // selalu ambil tanggal real-time
  const day = today.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${format(monday)} – ${format(sunday)}`;
}

const ReadingChart: React.FC<ReadingChartProps> = ({ weeklyStats, loadingWeeklyStats }) => {
  const labels = weeklyStats.map((d) => d.day);
  const data = {
    labels,
    datasets: [
      {
        label: 'Reading Time (minutes)',
        data: weeklyStats.map((d) => d.readingTime),
        backgroundColor: 'rgba(30, 58, 138, 0.8)',
      },
      {
        label: 'Pages Read',
        data: weeklyStats.map((d) => d.pagesRead),
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
      },
    ],
  };

  const weekStart = (() => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  })();

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
      tooltip: {
        callbacks: {
          title: function(context: any) {
            // context[0].dataIndex = 0 for Monday, 1 for Tuesday, etc.
            const idx = context[0].dataIndex;
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + idx);
            return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const isEmpty = data.datasets.every(ds => ds.data.every(v => v === 0));
  const weekRangeLabel = getCurrentWeekRangeLabel();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">
          Weekly Reading Activity <span className="font-normal text-sm text-gray-500">({weekRangeLabel})</span>
        </h3>
      </div>
      {/* <p className="text-sm text-gray-500 mb-4">{weekRangeLabel}</p> */}
      <div className="h-64">
        {loadingWeeklyStats ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <Bar data={data} options={options} />
            {isEmpty && (
              <div className="text-center text-gray-400 mt-8">No reading activity this week.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReadingChart;