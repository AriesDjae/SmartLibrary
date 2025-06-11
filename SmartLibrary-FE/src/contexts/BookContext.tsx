import React, { createContext, useContext, useState } from 'react';
import { mockBooks } from '../data/mockData';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genres: string[];
  publishedDate: string;
  rating: number;
  pageCount: number;
  isbn: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
}

interface BookContextType {
  books: Book[];
  featuredBooks: Book[];
  popularBooks: Book[];
  newArrivals: Book[];
  getBookById: (id: string) => Book | undefined;
  searchBooks: (query: string) => Book[];
  filterBooksByGenre: (genre: string) => Book[];
  getUserRecommendations: () => Book[];
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books] = useState<Book[]>(mockBooks);
  
  const featuredBooks = books.filter(book => book.isFeatured);
  const popularBooks = books.filter(book => book.isPopular);
  const newArrivals = books.filter(book => book.isNew);
  
  const getBookById = (id: string) => {
    return books.find(book => book.id === id);
  };
  
  const searchBooks = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) || 
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.description.toLowerCase().includes(lowercaseQuery) ||
      book.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
    );
  };
  
  const filterBooksByGenre = (genre: string) => {
    return books.filter(book => 
      book.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  };
  
  // Simulated AI recommendation algorithm
  const getUserRecommendations = () => {
    // In a real app, this would use user preferences, reading history, etc.
    // For now, return a random selection of books
    return [...books]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  };
  
  const value = {
    books,
    featuredBooks,
    popularBooks,
    newArrivals,
    getBookById,
    searchBooks,
    filterBooksByGenre,
    getUserRecommendations,
  };
  
  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};