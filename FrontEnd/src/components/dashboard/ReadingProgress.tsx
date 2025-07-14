import React from 'react';

interface ReadingProgressProps {
  userInteractions: Array<{
    _id: string;
    type: string;
    book_id: string;
    progress: number;
    book_detail: {
      _id: string;
      title: string;
      author: string;
      coverImage: string;
      pageCount: number;
    };
    timestamp?: string;
  }>;
}

const CurrentlyReading: React.FC<{
  book: any;
  progress?: number;
  lastRead?: string;
}> = ({ book, progress, lastRead }) => {
  if (!book) return null;
  console.log('DEBUG progress:', progress, 'book:', book?.title);
  const progressPercent = Math.round((progress ?? 0) * 100);
  const formattedDate = lastRead
    ? new Date(lastRead).toLocaleDateString('en-US', 
      { month: 'short', day: 'numeric' })
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

const ReadingProgress: React.FC<ReadingProgressProps> = ({ userInteractions }) => {
  //hanya buku dengan progress > 0
  const filteredInteractions = userInteractions.filter(
    (item) => item.progress && item.progress > 0
  );
  // Group by book_id, ambil progress terbesar/terakhir
  const bookMap = new Map<string, typeof filteredInteractions[0]>();
  filteredInteractions.forEach((item) => {
    const existing = bookMap.get(item.book_id);
    // Ambil progress terbesar, atau interaksi terbaru jika progress sama
    if (!existing || (item.progress > existing.progress) ||
        (item.progress === existing.progress && new Date(item.timestamp || 0) > new Date(existing.timestamp || 0))) {
      bookMap.set(item.book_id, item);
    }
  });
  const uniqueBooks = Array.from(bookMap.values());
  return (
    <div className="card">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-semibold text-lg">Currently Reading</h3>
      </div>
      <div>
        {uniqueBooks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No books being read now</div>
        ) : (
          uniqueBooks.map((item) => (
            <CurrentlyReading
              key={item.book_id}
              book={item.book_detail}
              progress={item.progress}
              lastRead={item.timestamp}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReadingProgress;