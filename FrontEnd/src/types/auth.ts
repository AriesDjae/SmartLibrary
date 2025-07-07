// Tipe data untuk User
export interface User {
  _id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  profile_picture?: string;
}

// Tipe data untuk update profile
export interface UserUpdateData {
  full_name?: string;
  email?: string;
  username?: string;
  profile_picture?: string;
}

// Tipe data untuk register
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id?: string;
  is_active?: boolean;
  profile_picture?: string;
}

// Tipe data untuk login
export interface LoginData {
  email: string;
  password: string;
}

// Tipe data untuk response API
export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  data?: User;
}

// Tipe data untuk message feedback
export interface Message {
  type: 'success' | 'error';
  text: string;
}

// Tipe data untuk auth context
export interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  signUp: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
  updateUserProfile: (userData: UserUpdateData) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
} 