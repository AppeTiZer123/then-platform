import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { officerRepo } from "@/lib/db/repositories";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const officers = await officerRepo.getAllActiveWithUser();
    return NextResponse.json({ ok: true, data: officers });
  } catch (err: unknown) {
    console.error("API GET officers error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { userId, rank, department } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "กรุณาเลือกผู้ใช้" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า user นี้เป็น officer อยู่แล้วหรือไม่
    const existing = await officerRepo.findByUserId(userId);
    if (existing && existing.isActive) {
      return NextResponse.json(
        { ok: false, error: "ผู้ใช้นี้เป็นเจ้าหน้าที่อยู่แล้ว" },
        { status: 409 },
      );
    }

    const officer = await officerRepo.create({
      userId,
      rank: rank || null,
      department: department || null,
    });

    return NextResponse.json({ ok: true, data: officer }, { status: 201 });
  } catch (err: unknown) {
    console.error("API POST officers error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
