import { NextResponse } from "next/server";
import postgres from "postgres";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL not set" },
      { status: 500 },
    );
  }

  // สร้าง connection ตรงแทนใช้ Drizzle เพื่อยิง raw SQL ตรงๆ ไปที่ DB (debug ดูข้อมูลดิบ)
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    // Return full rows (all columns) from both tables for inspection
    const reportsRows = await sql`
      SELECT * FROM then_app.reports
      LIMIT 500
    `;

    try {
      await sql.end();
    } catch {
      /* ignore */
    }
    return NextResponse.json({
      ok: true,
      reports: reportsRows,
    });
  } catch (err: unknown) {
    try {
      await sql.end();
    } catch {
      /* ignore */
    }
    console.error("Raw reports error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
