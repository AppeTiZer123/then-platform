import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/reports/mine — ดึง reports ทั้งหมดของ user ที่ login อยู่
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const myReports = await db
      .select({
        id: reports.id,
        caseNumber: reports.caseNumber,
        status: reports.status,
        incidentDate: reports.incidentDate,
        damageAmount: reports.damageAmount,
        createdAt: reports.createdAt,
        hasDocument: reports.aiGeneratedDocument, // null = ไม่มี PDF, มีค่า = โหลดได้
      })
      .from(reports)
      .where(eq(reports.reporterId, session.user.id))
      .orderBy(desc(reports.createdAt));

    // แปลง hasDocument → boolean เพื่อไม่ expose ข้อมูล JSON
    const result = myReports.map((r) => ({
      id: r.id,
      caseNumber: r.caseNumber,
      status: r.status,
      incidentDate: r.incidentDate,
      damageAmount: r.damageAmount,
      createdAt: r.createdAt,
      canDownload: r.hasDocument !== null,
    }));

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Fetch my reports error:", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
