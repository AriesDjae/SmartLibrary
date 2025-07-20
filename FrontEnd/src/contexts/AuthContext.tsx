import React, { createContext, useContext, useState, useEffect } from "react";
import { login, register, getProfile, updateProfile } from "../services/api";
import {
  User,
  UserUpdateData,
  RegisterData,
  ApiResponse,
  AuthContextType,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔄 AuthContext: Loading user profile from token...");
      getProfile()
        .then((user: User) => {
          console.log("✅ AuthContext: User profile loaded:", {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
          });
          setCurrentUser(user);
        })
        .catch((error) => {
          console.error("❌ AuthContext: Failed to load user profile:", error);
          setCurrentUser(null);
          localStorage.removeItem("token");
        });
    } else {
      console.log("ℹ️ AuthContext: No token found, user not authenticated");
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res: ApiResponse = await login(email, password);
      if (res.success && res.token) {
        localStorage.setItem("token", res.token);
        const user = await getProfile();
        setCurrentUser(user);
        // Tambahkan ini:
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...user,
            _id: user._id || user.id,
          })
        );
        return { success: true, user };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error: any) {
      return { success: false, message: error.message || "Login failed" };
    }
  };

  const signUp = async (userData: RegisterData) => {
    try {
      const res: ApiResponse = await register(userData);
      return { success: res.success, message: res.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    window.location.href = "/sign-in";
  };

  const updateUserProfile = async (userData: UserUpdateData) => {
    console.log("🔄 AuthContext: Updating user profile...", {
      userId: currentUser?._id,
      updateData: userData,
    });

    try {
      if (!currentUser?._id) {
        console.error("❌ AuthContext: No current user ID found");
        return { success: false, message: "User not found" };
      }

      const res: ApiResponse = await updateProfile(currentUser._id, userData);
      console.log("📡 AuthContext: API response:", res);

      if (res.success) {
        // Update current user data with the response data if available
        const updatedUser = res.data
          ? { ...currentUser, ...res.data }
          : { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        console.log("✅ AuthContext: User profile updated successfully");
        return {
          success: true,
          message: res.message || "Profile updated successfully",
        };
      }

      console.error("❌ AuthContext: API returned failure:", res.message);
      return {
        success: false,
        message: res.message || "Failed to update profile",
      };
    } catch (error: any) {
      console.error("❌ AuthContext: Error updating profile:", {
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: error.message || "Failed to update profile",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
