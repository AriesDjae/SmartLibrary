import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signIn: (credentials: { email: string; password: string }) =>
    api.post('/auth/signin', credentials),
  signUp: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', userData),
  signOut: () => api.post('/auth/signout'),
};

// Books API
export const booksAPI = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (bookData: any) => api.post('/books', bookData),
  update: (id: string, bookData: any) => api.put(`/books/${id}`, bookData),
  delete: (id: string) => api.delete(`/books/${id}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: any) => api.put('/users/profile', userData),
  getBorrowedBooks: () => api.get('/users/borrowed-books'),
  borrowBook: (bookId: string) => api.post(`/users/borrow/${bookId}`),
  returnBook: (bookId: string) => api.post(`/users/return/${bookId}`),
};

export default api;
