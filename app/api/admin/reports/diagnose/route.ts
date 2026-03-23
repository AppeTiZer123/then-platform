import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const envSet = !!process.env.DATABASE_URL;
    let dbOk = false;
    let count = null;
    let errorMsg = null;

    try {
      // Try dynamic import and a simple query to count reports
      const mod = await import("@/lib/actions/reports");
      const results = await mod.getAllReports();
      dbOk = Array.isArray(results);
      count = dbOk ? results.length : null;
    } catch (err: unknown) {
      errorMsg = err instanceof Error ? err.message : String(err);
    }

    return NextResponse.json({
      ok: true,
      env: { DATABASE_URL: envSet },
      dbOk,
      count,
      error: errorMsg,
    });
  } catch (error: unknown) {
    console.error("Diagnose error", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
