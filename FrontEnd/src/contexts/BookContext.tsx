import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
// import { mockBooks } from "../data/mockData";
import axios from "../services/axios";

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
  loading: boolean; //aulira
  getBookById: (id: string) => Book | undefined;
  searchBooks: (query: string) => Book[];
  filterBooksByGenre: (genre: string) => Book[];
  getUserRecommendations: () => Book[];
}

const BookContext = createContext<BookContextType | undefined>(undefined);
// const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  //Data Fetching
  useEffect(() => {
    axios.get("/books/featured").then(res => {
      console.log("Featured books response:", res.data);
      setFeaturedBooks(res.data.data)});
    axios.get("/books/popular").then(res => {
      console.log("Popular books response:", res.data);
      setPopularBooks(res.data.data)});
    axios.get("/books/new-arrivals").then(res => {
      console.log("new arrivals books response:", res.data);
      setNewArrivals(res.data.data)});
    axios.get("/books").then(res => setBooks(res.data.data));
  }, []);

  const getBookById = (id: string) => {
    if (!id) return undefined;
    return books.find((book) => book.id === id);
  };

  const searchBooks = (query: string) => {
    if (!query.trim()) return books;

    const lowercaseQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.description.toLowerCase().includes(lowercaseQuery) ||
        (book.genres && Array.isArray(book.genres) &&
        book.genres.some((genre) =>
          genre.toLowerCase().includes(lowercaseQuery)
        ))
    );
  };

  const filterBooksByGenre = (genre: string) => {
    if (!genre) return books;

    const lowercaseGenre = genre.toLowerCase();
    return books.filter((book) =>
      book.genres && Array.isArray(book.genres) &&
      book.genres.some((g) => g.toLowerCase() === lowercaseGenre)
    );
  };

  // Simulated AI recommendation algorithm
  const getUserRecommendations = () => {
    if (!books.length) return [];

    // Filter buku yang memiliki genres
    const booksWithGenres = books.filter(book => 
    book.genres && Array.isArray(book.genres)
    );
    // In a real app, this would use user preferences, reading history, etc.
    // For now, return a random selection of books
    return [...books].sort(() => 0.5 - Math.random()).slice(0, 6);
  };

  const value = {
    books,
    featuredBooks,
    popularBooks,
    newArrivals,
    loading,
    getBookById,
    searchBooks,
    filterBooksByGenre,
    getUserRecommendations,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};
