// console.log("BookDetailPage id:", id);
import React, { useState, useEffect } from "react";
import { useBooks, Book } from "../contexts/BookContext";
import BookCard from "../components/books/BookCard";
import { Filter, Search, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from '../services/axios';

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  coverImage: string;
  description: string;
  rating: number;
  isAvailable: boolean;
}

//aulira
interface Genre {
  _id: string;
  genres_name: string;
}

const BookCollectionPage: React.FC = () => {
  
  const { books, searchBooks, filterBooksByGenre } = useBooks();
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const location = useLocation();

  // Extract all unique genres from books
  // const allGenres = Array.from(
  //   new Set(books?.flatMap((book) => book.genres || []) || [])
  // ).sort();

  //fetch genres
  useEffect(() => {
    axios.get('/genres')
      .then(res => setGenres(res.data.data))
      .catch(() => setGenres([]))
      .finally(() => setLoadingGenres(false));
  }, []);

  useEffect(() => {
    // Initialize filtered books with all books
    if (books) {
      setFilteredBooks(books);
    }
  }, [books]);

  useEffect(() => {
    // Check for search query in URL
    const params = new URLSearchParams(location.search);
    const queryParam = params.get("search");
    if (queryParam && books) {
      setSearchQuery(queryParam);
      setFilteredBooks(searchBooks(queryParam));
    }
  }, [location.search, searchBooks, books]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!books) return;

    if (searchQuery.trim()) {
      const results = searchBooks(searchQuery);
      setFilteredBooks(results);
    } else {
      setFilteredBooks(
        selectedGenre ? filterBooksByGenre(selectedGenre) : books
      );
    }
  };

  const handleGenreSelect = (genreName: string) => {
    if (!books) return;

    setSelectedGenre(genreName === selectedGenre ? "" : genreName);

    if (genreName === selectedGenre) {
      // Deselecting current genre
      setFilteredBooks(searchQuery ? searchBooks(searchQuery) : books);
    } else {
      const genreFiltered = filterBooksByGenre(genreName);
      setFilteredBooks(
        searchQuery
          ? genreFiltered.filter(
              (book) =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : genreFiltered
      );
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  //aulira
  // Show loading state if books are not yet loaded
  if (!books || books.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Koleksi Buku</h1>
          <p className="text-gray-600">
            Jelajahi koleksi buku kami yang beragam dari berbagai genre.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat koleksi buku...</p>
        </div>
      </div>
    );
  }
  //aulira^

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Koleksi Buku</h1>
        <p className="text-gray-600">
          Jelajahi koleksi buku kami yang beragam dari berbagai genre.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters for Desktop */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Genre</h3>
            <div className="space-y-2">

              {loadingGenres ? (
                  <div>Loading genres...</div>
                ) : genres.length === 0 ? (
                  <div className="text-gray-400">Tidak ada genre</div>
                ) : (
                  genres.map((genre) => (
                    <button
                      key={genre._id}
                      onClick={() => handleGenreSelect(genre.genres_name)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedGenre === genre.genres_name
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {genre.genres_name}
                    </button>
                  ))
              )}

              {/* //aulira^^ */}

              {/* {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedGenre === genre
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {genre}
                </button>
              ))} */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow relative">
              <input
                type="text"
                placeholder="Cari berdasarkan judul, penulis, atau kata kunci..."
                className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button type="submit" className="hidden">
                Search
              </button>
            </form>

            {/* Mobile Filter Toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={toggleFilters}
            >
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre._id}
                    onClick={() => handleGenreSelect(genre.genres_name)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedGenre === genre.genres_name
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {genre.genres_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">
                Tidak ada buku ditemukan
              </h3>
              <p className="text-gray-600">
                Coba sesuaikan pencarian atau filter Anda untuk menemukan apa
                yang Anda cari.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCollectionPage;
