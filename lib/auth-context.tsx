"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  logout: () => void;
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock OTP - always "123456"
const MOCK_OTP = "123456";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("then_user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const login = async (phone: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPendingPhone(phone);
    // In real app, this would send OTP via SMS
    console.log(`[Mock] OTP sent to ${phone}: ${MOCK_OTP}`);
    return true;
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    if (!pendingPhone) return false;
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (otp === MOCK_OTP) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: "",
        phone: pendingPhone,
        isVerified: true,
      };
      setUser(newUser);
      localStorage.setItem("then_user", JSON.stringify(newUser));
      setPendingPhone(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setPendingPhone(null);
    localStorage.removeItem("then_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOTP,
        logout,
        pendingPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
