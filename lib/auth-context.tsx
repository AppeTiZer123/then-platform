"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { findOrCreateUser, findUserById } from "@/lib/actions/user";

interface User {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  role: string | null;
  isVerified: boolean | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean; // user ใหม่ที่ยังไม่มี name
  login: (phone: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock OTP - always "123456" (จะเปลี่ยนเป็น OTP จริงในอนาคต)
const MOCK_OTP = "123456";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initial load จาก localStorage (client-side only)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("then_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("then_user");
        }
      }
    }
    return null;
  });
  const [isLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Check ว่าเป็น user ใหม่หรือไม่ (ยังไม่มี name)
  const isNewUser = !!(user && !user.name);

  const login = async (phone: string): Promise<boolean> => {
    // Simulate sending OTP (ในอนาคตจะส่ง SMS จริง)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPendingPhone(phone);
    console.log(`[Mock] OTP sent to ${phone}: ${MOCK_OTP}`);
    return true;
  };

  const verifyOTP = async (otp: string): Promise<{ success: boolean; isNewUser: boolean }> => {
    if (!pendingPhone) return { success: false, isNewUser: false };
    
    if (otp === MOCK_OTP) {
      try {
        // เชื่อมต่อกับ database จริง
        const dbUser = await findOrCreateUser(pendingPhone);
        
        const authUser: User = {
          id: dbUser.id,
          name: dbUser.name,
          phone: dbUser.phone,
          email: dbUser.email,
          role: dbUser.role,
          isVerified: dbUser.isVerified,
        };
        
        setUser(authUser);
        localStorage.setItem("then_user", JSON.stringify(authUser));
        setPendingPhone(null);
        
        // Return ว่าเป็น new user หรือไม่ (ไม่มี name = user ใหม่)
        return { success: true, isNewUser: !authUser.name };
      } catch (error) {
        console.error("Error creating/finding user:", error);
        return { success: false, isNewUser: false };
      }
    }
    return { success: false, isNewUser: false };
  };

  const logout = () => {
    setUser(null);
    setPendingPhone(null);
    localStorage.removeItem("then_user");
  };

  // Refresh user data จาก database
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const dbUser = await findUserById(user.id);
      if (dbUser) {
        const authUser: User = {
          id: dbUser.id,
          name: dbUser.name,
          phone: dbUser.phone,
          email: dbUser.email,
          role: dbUser.role,
          isVerified: dbUser.isVerified,
        };
        setUser(authUser);
        localStorage.setItem("then_user", JSON.stringify(authUser));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isNewUser,
        login,
        verifyOTP,
        logout,
        refreshUser,
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

