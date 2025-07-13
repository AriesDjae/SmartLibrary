import React from 'react';
import { Book, BookOpen, Clock } from 'lucide-react';
// import { useBooks } from '../../contexts/BookContext';
// import { mockUserActivity } from '../../data/mockData';

interface ReadingProgressProps {
  userInteractions: Array<{
    type: string;
    bookId: string;
    timestamp?: string;
    progress?: number;
    lastRead?: string;
  }>;
  getBookById: (id: string) => any;
}

// Komponen untuk satu buku yang sedang dibaca
const CurrentlyReading: React.FC<{
  book: any;
  progress?: number;
  lastRead?: string;
}> = ({ book, progress, lastRead }) => {
  if (!book) return null;
  const progressPercent = Math.round((progress ?? 0) * 100);
  const formattedDate = lastRead
    ? new Date(lastRead).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-0">
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-16 h-20 object-cover rounded shadow-sm"
      />
      <div className="flex-grow">
        <h4 className="font-medium">{book.title}</h4>
        <p className="text-sm text-gray-600">{book.author}</p>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-500">
              Page {Math.round((book.pageCount ?? 0) * (progress ?? 0))} of {book.pageCount}
            </span>
            <span className="text-xs text-gray-500">{lastRead ? `Last read: ${formattedDate}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadingProgress: React.FC<ReadingProgressProps> = ({ userInteractions, getBookById }) => {
  // Filter interaksi 'read' dan urutkan terbaru
  const readingInteractions = userInteractions
    .filter(i => i.type === 'read')
    .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());

  // Ambil buku unik yang sedang dibaca
  const currentlyReadingBooks: Array<{ book: any; progress?: number; lastRead?: string }> = [];
  const seen = new Set();
  for (const interaction of readingInteractions) {
    if (!seen.has(interaction.bookId)) {
      seen.add(interaction.bookId);
      const book = getBookById(interaction.bookId);
      if (book) {
        currentlyReadingBooks.push({
          book,
          progress: interaction.progress,
          lastRead: interaction.lastRead || interaction.timestamp,
        });
      }
    }
  }

  return (
    <div className="card">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-semibold text-lg">Currently Reading</h3>
      </div>
      <div>
        {currentlyReadingBooks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No books being read now</div>
        ) : (
          currentlyReadingBooks.map(({ book, progress, lastRead }) => (
            <CurrentlyReading
              key={book.id}
              book={book}
              progress={progress}
              lastRead={lastRead}
            />
          ))
        )}
      </div>
      {/* Bagian statistik bisa tetap pakai props/statistik lain jika perlu */}
    </div>
  );
};

export default ReadingProgress;