import axiosInstance from "./axios";

// Auth Services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
};

// Book Services
export const bookService = {
  getAllBooks: async () => {
    const response = await axiosInstance.get("/books");
    return response.data;
  },
  getBookById: async (id: string) => {
    const response = await axiosInstance.get(`/books/${id}`);
    return response.data;
  },
  createBook: async (bookData: any) => {
    const response = await axiosInstance.post("/books", bookData);
    return response.data;
  },
  updateBook: async (id: string, bookData: any) => {
    const response = await axiosInstance.put(`/books/${id}`, bookData);
    return response.data;
  },
  deleteBook: async (id: string) => {
    const response = await axiosInstance.delete(`/books/${id}`);
    return response.data;
  },
};
