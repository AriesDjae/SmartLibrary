import React from "react";
import { Link } from "react-router-dom";
import { Book as BookIcon, Star } from "lucide-react";
import { Book } from "../../contexts/BookContext";
import { motion } from "framer-motion";

interface BookCardProps {
  book: Book;
  size?: "small" | "medium" | "large";
}

const BookCard: React.FC<BookCardProps> = ({ book, size = "medium" }) => {
  const { id, title, author, coverImage, genres, rating, isAvailable } = book;

  // Determine card sizing and styling based on size prop
  const cardClasses = {
    small: "h-48 sm:h-56",
    medium: "h-64 sm:h-72 md:h-80",
    large: "h-80 sm:h-88 md:h-96",
  };

  const titleClasses = {
    small: "text-sm sm:text-base",
    medium: "text-base sm:text-lg",
    large: "text-lg sm:text-xl",
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow duration-300 ${cardClasses[size]}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/books/${id}`} className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Book Cover */}
          <div className="relative h-3/4 overflow-hidden">
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <BookIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Availability Tag */}
            {!isAvailable && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Dipinjam
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <h3 className={`font-medium line-clamp-2 ${titleClasses[size]}`}>
                {title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{author}</p>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {/* Rating */}
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm ml-1">{rating}</span>
              </div>

              {/* Primary Genre Tag */}
              {genres && genres.length > 0 && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {genres[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
