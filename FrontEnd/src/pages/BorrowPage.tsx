import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Smile,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  BookCheck,
  ArrowRightCircle,
  Library,
  BookMarked,
  BookText,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBorrow } from "../contexts/BorrowContext";

const BorrowPage: React.FC = () => {
  const { borrowedBooks, removeBorrowedBook, fetchBorrowedBooks } = useBorrow();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("semua");

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn = (id: number) => {
    removeBorrowedBook(id);
  };

  const filteredBooks = borrowedBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "semua" ||
      (book.category && book.category.toLowerCase() === selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Icons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Library size={40} className="text-blue-400" />
              <BookMarked size={40} className="text-blue-500" />
              <BookText size={40} className="text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700 text-center">
              Peminjaman Buku
            </h1>
            <p className="text-gray-600 mt-2 text-center">
              Kelola buku yang sedang Anda pinjam
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Link
              to="/books"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg"
            >
              <Plus size={20} />
              Pinjam Buku Baru
            </Link>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari buku yang dipinjam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="semua">Semua Kategori</option>
                <option value="fiksi">Fiksi</option>
                <option value="pendidikan">Pendidikan</option>
                <option value="anak">Anak-anak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books List Section */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center gap-4 mb-6">
              <BookOpen size={48} className="text-blue-400" />
              <BookCheck size={48} className="text-blue-500" />
            </div>
            <Smile size={64} className="text-yellow-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">
              Belum ada buku yang dipinjam.
            </p>
            <p className="text-gray-500 mb-6">
              Ayo jelajahi koleksi buku dan mulai membaca bersama keluarga!
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg"
            >
              <BookOpen size={20} />
              Cari Buku
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => {
              const daysRemaining = getDaysRemaining(book.dueDate);
              const isOverdue = daysRemaining < 0;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-32 h-44 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                              {book.title}
                            </h2>
                            <p className="text-gray-600 mb-2">{book.author}</p>
                            <p className="text-sm text-gray-500 mb-4">
                              {book.description}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {book.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-blue-500" size={18} />
                            <div>
                              <p className="text-sm text-gray-500">Dipinjam</p>
                              <p className="text-sm font-medium">
                                {book.borrowedDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="text-blue-500" size={18} />
                            <div>
                              <p className="text-sm text-gray-500">
                                Jatuh Tempo
                              </p>
                              <p className="text-sm font-medium">
                                {book.dueDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle
                              className={
                                isOverdue ? "text-red-500" : "text-green-500"
                              }
                              size={18}
                            />
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p
                                className={`text-sm font-medium ${
                                  isOverdue ? "text-red-500" : "text-green-500"
                                }`}
                              >
                                {isOverdue
                                  ? "Terlambat"
                                  : `${daysRemaining} hari tersisa`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleReturn(book.id)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition shadow"
                          >
                            <ArrowRightCircle size={18} />
                            Kembalikan Buku
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowPage;
