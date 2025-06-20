import React, { createContext, useContext, useState, ReactNode } from "react";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
  status: string;
  cover: string;
  category?: string;
  description?: string;
}

interface BorrowContextType {
  borrowedBooks: BorrowedBook[];
  addBorrowedBook: (book: BorrowedBook) => void;
  removeBorrowedBook: (id: number) => void;
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

  const removeBorrowedBook = (id: number) => {
    setBorrowedBooks((prev) => prev.filter((book) => book.id !== id));
  };

  return (
    <BorrowContext.Provider
      value={{ borrowedBooks, addBorrowedBook, removeBorrowedBook }}
    >
      {children}
    </BorrowContext.Provider>
  );
};

export default BorrowContext;
