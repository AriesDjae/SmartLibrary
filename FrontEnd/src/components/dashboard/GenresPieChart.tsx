import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Props untuk GenresPieChart
interface GenresPieChartProps {
  borrowings: Array<{
    books_id: string;
    book?: any;
  }>;
  userInteractions: Array<{
    type: string;
    bookId: string;
  }>;
  getBookById: (id: string) => any;
}

const GenresPieChart: React.FC<GenresPieChartProps> = ({ borrowings, userInteractions, getBookById }) => {
  // Hitung genre favorit user dari semua interaksi (peminjaman, baca, save, search)
  const genreCount = useMemo(() => {
    const count: Record<string, number> = {};

    // 1. Hitung dari peminjaman
    borrowings.forEach(borrowing => {
      let genres: string[] = [];
      if (borrowing.book && Array.isArray(borrowing.book.genres)) {
        genres = borrowing.book.genres;
      } else {
        const book = getBookById(borrowing.books_id);
        if (book && Array.isArray(book.genres)) genres = book.genres;
      }
      genres.forEach(genre => {
        if (!genre) return;
        count[genre] = (count[genre] || 0) + 1;
      });
    });

    // 2. Hitung dari interaksi user (baca, save, search)
    userInteractions.forEach(interaction => {
      const book = getBookById(interaction.bookId);
      if (book && Array.isArray(book.genres)) {
        book.genres.forEach((genre: string) => {
          if (!genre) return;
          // Komentar: Setiap interaksi (baca, save, search) menambah 1 ke genre terkait
          count[genre] = (count[genre] || 0) + 1;
        });
      }
    });

    return count;
  }, [borrowings, userInteractions, getBookById]);

  // Hanya genre favorit user (pernah dipinjam)
  const genreLabelsAll = Object.keys(genreCount);
  const genreValuesAll = genreLabelsAll.map(label => genreCount[label]);

  // Hitung total interaksi
  const totalInteractions = genreValuesAll.reduce((a, b) => a + b, 0);

  // Buat array [{label, value, percentage}]
  const genreData = genreLabelsAll.map((label, i) => ({
    label,
    value: genreValuesAll[i],
    percentage: totalInteractions > 0 ? genreValuesAll[i] / totalInteractions : 0
  }));
  // Urutkan dari terbesar ke terkecil
  genreData.sort((a, b) => b.value - a.value);

  // Ambil top 5 genre
  const topN = 5;
  const topGenres = genreData.slice(0, topN);
  const otherGenres = genreData.slice(topN);
  const otherValue = otherGenres.reduce((a, b) => a + b.value, 0);

  // Label dan value untuk chart
  const genreLabels = topGenres.map(g => g.label);
  const genreValues = topGenres.map(g => g.value);
  // Array warna unik: kombinasi vivid & pastel, 21 warna
  const genreColors = [
    '#06923E', // vivid pink
    '#0D5EA6', // vivid blue
    '#FF8383', // vivid yellow
    '#4BC0C0', // vivid turquoise
    '#9966FF', // vivid purple
    '#FF9F40', // vivid orange
    '#00E396', // vivid green
    '#F44336', // vivid red
    '#00B8D9', // vivid cyan
    '#FFD600', // vivid gold
    '#8CCDEB', // pastel blue
    '#328E6E', // pastel green
    '#FF4F0F', // pastel peach
    '#CF0F47', // pastel pink
    '#8E7DBE', // pastel purple
    '#86A788', // pastel mint
    '#FFC107', // pastel yellow
    '#4ED7F1', // pastel indigo
    '#4A102A', // pastel rose
    '#B2F7EF', // pastel aqua
    '#821131', // pastel magenta
  ];
  // Mapping warna ke genre, tidak ada warna yang sama
  const backgroundColors = genreLabels.map((_, i) => genreColors[i]);

  const data = {
    labels: genreLabels,
    datasets: [
      {
        data: genreValues,
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
            return `${context.label}: ${value}x hits in your library (${percentage}%)`;
          }
        },
        bodyFont: { size: 20 }, // Perbesar font isi tooltip
        titleFont: { size: 22 }, // Perbesar font judul tooltip
      }
    },
    cutout: '40%',
  };

  return (
    <div className="card p-8">
      <h3 className="font-bold text-2xl mb-6 text-center tracking-wide">Favorite Genres</h3>
      <div className="h-[420px] md:h-[480px] flex items-center justify-center">
        {genreLabels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">No genre data</div>
        ) : (
          <Pie data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default GenresPieChart;