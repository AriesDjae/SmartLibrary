import React, { createContext, useContext, useState, ReactNode } from "react";

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
  status: string;
  cover: string;
  category?: string;
  description?: string;
  returnDate?: string | null;
  fine_amount?: number;
  fine_paid?: boolean;
}

interface BorrowContextType {
  borrowedBooks: BorrowedBook[];
  addBorrowedBook: (book: BorrowedBook) => void;
  removeBorrowedBook: (id: string) => void;
  fetchBorrowedBooks: () => Promise<void>;
}

const BorrowContext = createContext<BorrowContextType | undefined>(undefined);

export const useBorrow = () => {
  const context = useContext(BorrowContext);
  if (!context) {
    throw new Error("useBorrow must be used within a BorrowProvider");
  }
  return context;
};

interface BorrowProviderProps {
  children: ReactNode;
}

export const BorrowProvider: React.FC<BorrowProviderProps> = ({ children }) => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]); 

  const addBorrowedBook = (book: BorrowedBook) => {
    setBorrowedBooks((prev) => [...prev, book]);
  };

  const removeBorrowedBook = (id: string) => {
    setBorrowedBooks((prev) => prev.filter((book) => book.id !== id));
  };

  // Fetch data dari backend
  const fetchBorrowedBooks = async () => {
    try {
      const res = await fetch('/api/borrowings/my/borrowings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch borrowings');
      }
      
      const data = await res.json();
      console.log('DATA BORROWINGS:', data);
      
      // Transform data dari backend ke format yang diharapkan frontend
      const transformedBorrowings = data.data.map((borrowing: any) => ({
        id: borrowing._id,
        title: borrowing.book?.title || 'Unknown Book',
        author: borrowing.book?.author || 'Unknown Author',
        borrowedDate: new Date(borrowing.borrow_date).toISOString().split('T')[0],
        dueDate: new Date(borrowing.due_date).toISOString().split('T')[0],
        status: borrowing.is_borrow ? 'Dipinjam' : 'Dikembalikan',
        cover: borrowing.book?.coverImage || '',
        category: borrowing.book?.genres?.[0] || 'Lainnya',
        description: borrowing.book?.description || '',
        returnDate: borrowing.return_date ? new Date(borrowing.return_date).toISOString().split('T')[0] : null
      }));
      
      setBorrowedBooks(transformedBorrowings);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setBorrowedBooks([]);
    }
  };

  return (
    <BorrowContext.Provider
      value={{ borrowedBooks, addBorrowedBook, removeBorrowedBook, fetchBorrowedBooks }}
    >
      {children}
    </BorrowContext.Provider>
  );
};

export default BorrowContext;
