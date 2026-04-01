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
    const officers = await officerRepo.getAllActive();
    return NextResponse.json({ ok: true, data: officers });
  } catch (err: unknown) {
    console.error("API GET officers error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
