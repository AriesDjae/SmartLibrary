import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '../../contexts/BookContext';
import BookCard from './BookCard';

interface BookCarouselProps {
  title: string;
  books: Book[];
  description?: string;
}

const BookCarousel: React.FC<BookCarouselProps> = ({ title, books, description }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? Math.max(scrollPosition - scrollAmount, 0)
      : Math.min(scrollPosition + scrollAmount, container.scrollWidth - container.clientWidth);
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };
  
  // Check if we should show scroll buttons
  const showLeftButton = scrollPosition > 0;
  const showRightButton = containerRef.current 
    ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth - 10
    : true;
  
  return (
    <div className="relative py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      
      <div className="relative group">
        {/* Scroll Buttons */}
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-opacity opacity-90 hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        
        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-opacity opacity-90 hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
        
        {/* Books Container */}
        <div 
          ref={containerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 pt-2 px-1"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map(book => (
            <div key={book.id} className="flex-shrink-0 w-48 md:w-56">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCarousel;