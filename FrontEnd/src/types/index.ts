export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'librarian' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  booksRead: number;
  readingTime: number;
  lastLogin: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  cover: string;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  rating: number;
  totalCopies: number;
  availableCopies: number;
  publishedDate: string;
  description: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  bookTitle: string;
  userName: string;
  userAvatar?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'overdue' | 'returned' | 'renewed';
  renewalCount: number;
}

export interface Activity {
  id: string;
  type: 'borrow' | 'return' | 'reserve' | 'review' | 'login' | 'register';
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  book?: {
    title: string;
    cover: string;
  };
}

export interface Stats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueBooks: number;
  monthlyReads: number;
  popularCategories: { name: string; count: number; color: string; percentage: number }[];
  readingTrends: { month: string; books: number; users: number }[];
  userEngagement: { level: string; count: number; percentage: number }[];
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
} 