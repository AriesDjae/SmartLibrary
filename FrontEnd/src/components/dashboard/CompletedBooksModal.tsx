import React from "react";
import { useBooks } from "../../contexts/BookContext";

interface CompletedBooksModalProps {
  open: boolean;
  onClose: () => void;
  completedBookIds: string[];
}

const CompletedBooksModal: React.FC<CompletedBooksModalProps> = ({ open, onClose, completedBookIds }) => {
  const { books } = useBooks();
  if (!open) return null;

  const completedBooks = books.filter(book => completedBookIds.includes(book.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Books Completed</h2>
        {completedBooks.length === 0 ? (
          <p className="text-gray-500">No completed books found.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {completedBooks.map(book => (
              <li key={book.id} className="mb-2 border-b pb-2 last:border-0">
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-gray-600">by {book.author}</div>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-6 btn-primary w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CompletedBooksModal; 