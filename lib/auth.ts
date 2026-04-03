import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findOrCreateUser, findUserById } from "@/lib/actions/user";
import { officerRepo } from "@/lib/db/repositories";

function normalizeRole(role: unknown): string {
  if (typeof role !== "string") {
    return "user";
  }
  return role.toLowerCase().trim() || "user";
}

async function resolveEffectiveRole(userId: string, role: unknown): Promise<string> {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin" || normalizedRole === "officer") {
    return normalizedRole;
  }

  const officerProfile = await officerRepo.findByUserId(userId);
  if (officerProfile?.isActive) {
    return "officer";
  }

  return normalizedRole;
}

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
    // jwt callback ถูกเรียกทุกครั้งที่สร้างหรืออ่าน JWT token
    async jwt({ token, user, trigger, session }) {
      // เมื่อ login ครั้งแรก เก็บ user data ใน token
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
        token.role = await resolveEffectiveRole(user.id as string, user.role);
      }
      
      // trigger="update" เกิดเมื่อ client เรียก useSession().update() → ดึงข้อมูลล่าสุดจาก DB มา sync
      if (trigger === "update" && session) {
        // ดึงข้อมูลใหม่จาก DB
        const freshUser = await findUserById(token.id as string);
        if (freshUser) {
          token.name = freshUser.name;
          token.role = await resolveEffectiveRole(freshUser.id, freshUser.role);
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
        session.user.role = normalizeRole(token.role);
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
