import React, { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import BookCard from '../components/books/BookCard';
import { Filter, Search, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BookCollectionPage: React.FC = () => {
  const { books, searchBooks, filterBooksByGenre } = useBooks();
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  
  // Extract all unique genres from books
  const allGenres = Array.from(
    new Set(books.flatMap(book => book.genres))
  ).sort();
  
  useEffect(() => {
    // Check for search query in URL
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
      setFilteredBooks(searchBooks(queryParam));
    }
  }, [location.search, searchBooks]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchBooks(searchQuery);
      setFilteredBooks(results);
    } else {
      setFilteredBooks(selectedGenre ? filterBooksByGenre(selectedGenre) : books);
    }
  };
  
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    
    if (genre === selectedGenre) {
      // Deselecting current genre
      setFilteredBooks(searchQuery ? searchBooks(searchQuery) : books);
    } else {
      // Selecting a new genre
      const genreFiltered = filterBooksByGenre(genre);
      setFilteredBooks(searchQuery 
        ? genreFiltered.filter(book => 
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
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Collection</h1>
        <p className="text-gray-600">Explore our diverse collection of books across various genres.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters for Desktop */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Genres</h3>
            <div className="space-y-2">
              {allGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedGenre === genre
                      ? 'bg-primary-100 text-primary-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {genre}
                </button>
              ))}
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
                placeholder="Search by title, author, or keyword..."
                className="input py-2 pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button type="submit" className="hidden">Search</button>
            </form>
            
            {/* Mobile Filter Toggle */}
            <button 
              className="lg:hidden btn-outline flex items-center space-x-2"
              onClick={toggleFilters}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 card p-4">
              <h3 className="font-semibold text-lg mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedGenre === genre
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Results */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No books found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCollectionPage;