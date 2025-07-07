import axios from 'axios';
import { User, UserUpdateData, RegisterData, ApiResponse } from '../types/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Backend server URL
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
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
// export const authAPI = {
//   signIn: (credentials: { email: string; password: string }) =>
//     api.post('/auth/signin', credentials),
//   signUp: (userData: { name: string; email: string; password: string }) =>
//     api.post('/auth/signup', userData),
//   signOut: () => api.post('/auth/signout'),
// };

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
  updateProfile: (userData: UserUpdateData) => api.put('/users/profile', userData),
  getBorrowedBooks: () => api.get('/users/borrowed-books'),
  borrowBook: (bookId: string) => api.post(`/users/borrow/${bookId}`),
  returnBook: (bookId: string) => api.post(`/users/return/${bookId}`),
};

//aulira
// Fungsi untuk mengambil detail buku berdasarkan ID
export async function fetchBookDetail(bookId: string) {
  const response = await fetch(`/api/books/${bookId}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil detail buku');
  }
  return response.json();
}

export const register = async (userData: RegisterData): Promise<ApiResponse> => {
  const res = await api.post('/users/register', userData);
  return res as unknown as ApiResponse;
};

export const login = async (email: string, password: string): Promise<ApiResponse> => {
  const res = await api.post('/users/login', {email, password});
  return res as unknown as ApiResponse;
};

export const getProfile = async (): Promise<User> => {
  console.log('🔍 API: Getting user profile...');
  
  try {
    const res = await api.get('/users/profile') as any;
    console.log('✅ API: Profile retrieved successfully:', {
      hasUser: !!res.user,
      userId: res.user?._id,
      email: res.user?.email
    });
    return res.user;
  } catch (error: any) {
    console.error('❌ API: Failed to get profile:', {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

// export const fetchGenres = async () => {
//   const response = await axios.get('/genres');
//   return response.data.data; // sesuai response backend
// };

export const updateProfile = async (userId: string, userData: UserUpdateData): Promise<ApiResponse> => {
  console.log("🔧 API: Updating user profile...", {
    userId,
    userData,
    endpoint: `/users/${userId}`
  });

  try {
    const res = await api.patch(`/users/${userId}`, userData) as unknown as ApiResponse;
    console.log("✅ API: Update success:", {
      success: res.success,
      message: res.message,
      hasData: !!res.data
    });
    return res;
  } catch (error: any) {
    console.error("❌ API: Update failed:", {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status,
      userId: userId
    });
    throw error;
  }
};

export default api;
