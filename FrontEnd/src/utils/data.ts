import { User, Book, Loan, Activity, Stats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@library.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    role: 'member',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2025-01-08T10:30:00Z',
    lastLogin: '2025-01-08T10:30:00Z',
    booksRead: 24,
    readingTime: 1440
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@library.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    role: 'member',
    status: 'active',
    joinDate: '2024-02-20',
    lastActive: '2025-01-08T09:15:00Z',
    lastLogin: '2025-01-08T09:15:00Z',
    booksRead: 18,
    readingTime: 1080
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@library.com',
    avatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    role: 'librarian',
    status: 'active',
    joinDate: '2023-11-10',
    lastActive: '2025-01-08T11:45:00Z',
    lastLogin: '2025-01-08T11:45:00Z',
    booksRead: 45,
    readingTime: 2700
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@library.com',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    role: 'admin',
    status: 'active',
    joinDate: '2023-06-01',
    lastActive: '2025-01-08T12:00:00Z',
    lastLogin: '2025-01-08T12:00:00Z',
    booksRead: 67,
    readingTime: 4020
  }
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    category: 'Classic Literature',
    cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop',
    status: 'available',
    rating: 4.2,
    totalCopies: 5,
    availableCopies: 3,
    publishedDate: '1925-04-10',
    description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    category: 'Classic Literature',
    cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop',
    status: 'borrowed',
    rating: 4.5,
    totalCopies: 4,
    availableCopies: 1,
    publishedDate: '1960-07-11',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0-441-17271-9',
    category: 'Science Fiction',
    cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop',
    status: 'available',
    rating: 4.7,
    totalCopies: 3,
    availableCopies: 2,
    publishedDate: '1965-08-01',
    description: 'Epic science fiction novel set on the desert planet Arrakis, featuring political intrigue and mystical elements.'
  },
  {
    id: '4',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    category: 'Dystopian Fiction',
    cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop',
    status: 'available',
    rating: 4.6,
    totalCopies: 6,
    availableCopies: 4,
    publishedDate: '1949-06-08',
    description: 'A dystopian social science fiction novel exploring themes of totalitarianism and surveillance.'
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0-14-143951-8',
    category: 'Romance',
    cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop',
    status: 'available',
    rating: 4.3,
    totalCopies: 4,
    availableCopies: 3,
    publishedDate: '1813-01-28',
    description: 'A romantic novel that critiques the British landed gentry at the end of the 18th century.'
  }
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    bookTitle: 'The Great Gatsby',
    userName: 'Alice Johnson',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop',
    borrowDate: '2025-01-01',
    dueDate: '2025-01-15',
    status: 'active',
    renewalCount: 0
  },
  {
    id: '2',
    bookId: '2',
    userId: '2',
    bookTitle: 'To Kill a Mockingbird',
    userName: 'Bob Smith',
    userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop',
    borrowDate: '2024-12-20',
    dueDate: '2025-01-03',
    status: 'overdue',
    renewalCount: 1
  },
  {
    id: '3',
    bookId: '3',
    userId: '3',
    bookTitle: 'Dune',
    userName: 'Carol Davis',
    userAvatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop',
    borrowDate: '2024-12-15',
    dueDate: '2024-12-29',
    returnDate: '2024-12-28',
    status: 'returned',
    renewalCount: 0
  },
  {
    id: '4',
    bookId: '4',
    userId: '1',
    bookTitle: '1984',
    userName: 'Alice Johnson',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop',
    borrowDate: '2025-01-05',
    dueDate: '2025-01-19',
    status: 'active',
    renewalCount: 0
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'borrow',
    description: 'Borrowed "The Great Gatsby"',
    timestamp: '2025-01-08T10:30:00Z',
    user: {
      name: 'Alice Johnson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop'
    },
    book: {
      title: 'The Great Gatsby',
      cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=40&h=60&fit=crop'
    }
  },
  {
    id: '2',
    type: 'return',
    description: 'Returned "Dune"',
    timestamp: '2025-01-08T09:15:00Z',
    user: {
      name: 'Carol Davis',
      avatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop'
    },
    book: {
      title: 'Dune',
      cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=40&h=60&fit=crop'
    }
  },
  {
    id: '3',
    type: 'review',
    description: 'Rated "1984" 5 stars',
    timestamp: '2025-01-08T08:45:00Z',
    user: {
      name: 'Bob Smith',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop'
    },
    book: {
      title: '1984',
      cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=40&h=60&fit=crop'
    }
  },
  {
    id: '4',
    type: 'register',
    description: 'New member joined',
    timestamp: '2025-01-08T07:30:00Z',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop'
    }
  }
];

export const mockStats: Stats = {
  totalBooks: 1250,
  totalUsers: 342,
  activeLoans: 89,
  overdueBooks: 12,
  monthlyReads: 156,
  popularCategories: [
    { name: 'Fiction', count: 45, color: '#3B82F6', percentage: 28.8 },
    { name: 'Non-Fiction', count: 32, color: '#10B981', percentage: 20.5 },
    { name: 'Science Fiction', count: 28, color: '#8B5CF6', percentage: 17.9 },
    { name: 'Mystery', count: 25, color: '#F59E0B', percentage: 16.0 },
    { name: 'Romance', count: 26, color: '#EF4444', percentage: 16.7 }
  ],
  readingTrends: [
    { month: 'Jan', books: 45, users: 23 },
    { month: 'Feb', books: 52, users: 28 },
    { month: 'Mar', books: 48, users: 25 },
    { month: 'Apr', books: 61, users: 32 },
    { month: 'May', books: 55, users: 29 },
    { month: 'Jun', books: 67, users: 35 }
  ],
  userEngagement: [
    { level: 'High', count: 45, percentage: 13.2 },
    { level: 'Medium', count: 128, percentage: 37.4 },
    { level: 'Low', count: 169, percentage: 49.4 }
  ]
}; 