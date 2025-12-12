import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const PUT = auth(async (req: Request) => {
  try {
    const r = req as any;
    const user = r.auth?.user;
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const { action, role } = body;

    if (action === "toggleSuspend") {
      // Use role='suspended' as temporary suspended flag
      const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const current = existing[0] as any;
      const newRole = current?.role === "suspended" ? "user" : "suspended";
      const [updated] = await db.update(users).set({ role: newRole }).where(eq(users.id, id)).returning();
      return NextResponse.json({ user: updated });
    }

    if (action === "changeRole" && role) {
      const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
      return NextResponse.json({ user: updated });
    }

    if (action === "update") {
      const { name, email, phone, role: newRole } = body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (newRole !== undefined) updateData.role = newRole;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
      }

      // Validate unique constraints before attempting update to return friendly errors
      if (email) {
        const existing = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));
        if (existing.length > 0 && existing[0].id !== id) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
      }
      if (phone) {
        const existingPhone = await db.select({ id: users.id, phone: users.phone }).from(users).where(eq(users.phone, phone));
        if (existingPhone.length > 0 && existingPhone[0].id !== id) {
          return NextResponse.json({ error: "Phone already in use" }, { status: 409 });
        }
      }

      try {
        const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
        return NextResponse.json({ user: updated });
      } catch (dbErr: any) {
        console.error("DB update error (users/[id]):", dbErr);
        // Prefer Postgres error code handling when available
        const code = dbErr?.code || dbErr?.cause?.code;
        const detail = dbErr?.detail || dbErr?.cause?.detail || "";
        if (code === "23505") {
          // unique_violation
          if (detail.toLowerCase().includes("email")) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
          }
          if (detail.toLowerCase().includes("phone")) {
            return NextResponse.json({ error: "Phone already in use" }, { status: 409 });
          }
          return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
        }

        // Fallback: return DB error message for debugging (temporary)
        const errMsg = String(dbErr?.message || dbErr || "Database error")
        return NextResponse.json({ error: errMsg }, { status: 500 });
      }
    }

    if (action === "resetPassword") {
      // Placeholder: real reset should generate token and send email
      return NextResponse.json({ success: true, message: "Reset link sent (placeholder)" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("/api/admin/users/[id] PUT error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
});

export const DELETE = auth(async (req: Request) => {
  try {
    const r = req as any;
    const user = r.auth?.user;
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("/api/admin/users/[id] DELETE error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
});
