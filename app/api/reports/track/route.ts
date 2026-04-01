import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Public endpoint — ค้นหาสถานะคดีด้วยหมายเลขอ้างอิง (ไม่ต้องล็อกอิน)
// เปิดเผยเฉพาะข้อมูลที่จำเป็น ไม่รวม PII ของผู้แจ้ง
export async function GET(req: NextRequest) {
  const caseNumber = req.nextUrl.searchParams.get("caseNumber");

  if (!caseNumber?.trim()) {
    return NextResponse.json(
      { ok: false, error: "caseNumber is required" },
      { status: 400 },
    );
  }

  try {
    const results = await db
      .select({
        id: reports.id,
        caseNumber: reports.caseNumber,
        status: reports.status,
        incidentDate: reports.incidentDate,
        incidentDetails: reports.incidentDetails,
        damageAmount: reports.damageAmount,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        aiGeneratedDocument: reports.aiGeneratedDocument,
      })
      .from(reports)
      .where(eq(reports.caseNumber, caseNumber.trim().toUpperCase()))
      .limit(1);

    if (!results[0]) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: results[0] });
  } catch (error) {
    console.error("Track API error:", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
