import React from 'react';
import { Book, BookOpen, Clock } from 'lucide-react';
import { useBooks } from '../../contexts/BookContext';
import { mockUserActivity } from '../../data/mockData';

interface CurrentlyReadingProps {
  bookId: string;
  progress: number;
  lastRead: string;
}

const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({ bookId, progress, lastRead }) => {
  const { getBookById } = useBooks();
  const book = getBookById(bookId);
  
  if (!book) return null;
  
  const progressPercent = Math.round(progress * 100);
  const formattedDate = new Date(lastRead).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
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
              Page {Math.round(book.pageCount * progress)} of {book.pageCount}
            </span>
            <span className="text-xs text-gray-500">Last read: {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadingProgress: React.FC = () => {
  return (
    <div className="card">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-semibold text-lg">Currently Reading</h3>
      </div>
      
      <div>
        {mockUserActivity.recentBooks.map(book => (
          <CurrentlyReading
            key={book.id}
            bookId={book.id}
            progress={book.progress}
            lastRead={book.lastRead}
          />
        ))}
      </div>
      
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-sm font-medium">{mockUserActivity.readingStats.booksCompleted}</p>
            <p className="text-xs text-gray-500">Books Read</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Book className="h-5 w-5 text-accent-600" />
            </div>
            <p className="text-sm font-medium">{mockUserActivity.readingStats.pagesRead}</p>
            <p className="text-xs text-gray-500">Pages Read</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock className="h-5 w-5 text-highlight-500" />
            </div>
            <p className="text-sm font-medium">{mockUserActivity.readingStats.timeSpent}h</p>
            <p className="text-xs text-gray-500">Reading Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;