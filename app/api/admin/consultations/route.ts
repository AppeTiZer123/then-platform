import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consultationRepo } from "@/lib/db/repositories/consultation.repo";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "officer")) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const consultations = await consultationRepo.getAll();

    return NextResponse.json({ ok: true, consultations });
  } catch (error) {
    console.error("GET /api/admin/consultations error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}
