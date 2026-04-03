import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const normalizedRole = (session?.user?.role || "").toLowerCase().trim();
  if (
    !session?.user ||
    (normalizedRole !== "admin" && normalizedRole !== "officer")
  ) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    // Dynamic import to avoid module import-time errors when DATABASE_URL is missing
    const mod = await import("@/lib/actions/reports");
    const data = await mod.getAllReports();
    return NextResponse.json({ ok: true, data });
  } catch (error: unknown) {
    console.error("API error fetching reports", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch reports", message },
      { status: 500 },
    );
  }
}
