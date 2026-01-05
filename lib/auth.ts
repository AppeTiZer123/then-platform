import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findOrCreateUser, findUserById } from "@/lib/actions/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "otp",
      name: "OTP Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        const { phone } = credentials as { phone?: string };

        if (!phone) {
          return null;
        }

        // สร้างหรือดึง user จาก DB
        const user = await findOrCreateUser(phone);

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // เมื่อ login ครั้งแรก เก็บ user data ใน token
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
        token.role = user.role;
      }
      
      // เมื่อเรียก update() จาก client - refresh token ด้วยข้อมูลใหม่
      if (trigger === "update" && session) {
        // ดึงข้อมูลใหม่จาก DB
        const freshUser = await findUserById(token.id as string);
        if (freshUser) {
          token.name = freshUser.name;
          token.role = freshUser.role;
          token.phone = freshUser.phone;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // ส่ง user data จาก token ไปที่ session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.name = token.name as string || null;
        session.user.role = token.role as string || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
  },
});
