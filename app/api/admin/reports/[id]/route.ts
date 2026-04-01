import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const mod = await import("@/lib/actions/reports");
    const rpt = await mod.getReportById(id);
    if (!rpt)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, data: rpt });
  } catch (err: unknown) {
    console.error("API get report by id error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, assignedOfficerId } = body;

    if (!status && !assignedOfficerId) {
      return NextResponse.json(
        { ok: false, error: "status หรือ assignedOfficerId จำเป็นต้องมีอย่างน้อย 1 อย่าง" },
        { status: 400 },
      );
    }

    const mod = await import("@/lib/db/repositories");

    // มอบหมายเจ้าหน้าที่ (พร้อมเปลี่ยน status เป็น in_progress อัตโนมัติ)
    if (assignedOfficerId) {
      const updated = await mod.reportRepo.assignOfficer(id, assignedOfficerId);
      if (!updated) {
        return NextResponse.json(
          { ok: false, error: "Report not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, data: updated });
    }

    // อัพเดท status อย่างเดียว
    const updated = await mod.reportRepo.updateStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Report not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    console.error("API PATCH report error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

