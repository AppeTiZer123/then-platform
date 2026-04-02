import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { officerRepo } from "@/lib/db/repositories";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
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
    const { rank, department } = body;

    const updated = await officerRepo.update(id, {
      rank: rank ?? undefined,
      department: department ?? undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "ไม่พบเจ้าหน้าที่" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    console.error("API PUT officer error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const deactivated = await officerRepo.deactivate(id);

    if (!deactivated) {
      return NextResponse.json(
        { ok: false, error: "ไม่พบเจ้าหน้าที่" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("API DELETE officer error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
