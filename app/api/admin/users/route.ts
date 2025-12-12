import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Protected route: only admin can access
export const GET = auth(async (req: Request) => {
  try {
    // @ts-ignore next-auth attaches auth on req when using `auth()` wrapper
    const r = req as any;
    const user = r.auth?.user;

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simple list of users (select existing columns)
    const result = await db
      .select({ id: users.id, phone: users.phone, name: users.name, email: users.email, role: users.role, isVerified: users.isVerified, createdAt: users.createdAt })
      .from(users);

    return NextResponse.json({ users: result });
  } catch (error: any) {
    console.error("/api/admin/users error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
});

export const POST = auth(async (req: Request) => {
  try {
    const r = req as any;
    const user = r.auth?.user;
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, role = "user", invite = false } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: "email or phone required" }, { status: 400 });
    }

    const [created] = await db.insert(users).values({ name, email, phone, role, isVerified: !!invite }).returning();

    // TODO: send invite email if invite === true (placeholder)

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error: any) {
    console.error("/api/admin/users POST error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
});
