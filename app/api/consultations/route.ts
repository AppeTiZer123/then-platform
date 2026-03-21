import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consultationRepo } from "@/lib/db/repositories/consultation.repo";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const consultations = await consultationRepo.getByUserId(session.user.id);

    return NextResponse.json({ ok: true, consultations });
  } catch (error) {
    console.error("GET /api/consultations error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subject, message, userName } = body;

    // Validate
    if (!subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const consultation = await consultationRepo.create({
      userId: session.user.id,
      userName: userName || session.user.name || "User",
      subject,
      message,
      status: "open",
    });

    return NextResponse.json({ ok: true, consultation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/consultations error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create consultation" },
      { status: 500 }
    );
  }
}
