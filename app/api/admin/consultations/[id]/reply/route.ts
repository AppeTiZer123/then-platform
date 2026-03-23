import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consultationRepo } from "@/lib/db/repositories/consultation.repo";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let consultationId = "unknown";
  try {
    const session = await auth();
    const { id } = await params;
    consultationId = id;

    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "officer")
    ) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message is required" },
        { status: 400 },
      );
    }

    // Add Response
    const responseData = await consultationRepo.addResponse(consultationId, {
      responderId: session.user.id,
      responderName: session.user.name || "เจ้าหน้าที่",
      message,
    });

    return NextResponse.json(
      { ok: true, response: responseData },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      `POST /api/admin/consultations/${consultationId}/reply error:`,
      error,
    );
    return NextResponse.json(
      { ok: false, error: "Failed to submit reply" },
      { status: 500 },
    );
  }
}
