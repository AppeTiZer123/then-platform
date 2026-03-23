import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "password-policy.json");

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const content = await fs.readFile(FILE, "utf-8");
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch {
    // if file not found, return default
    return NextResponse.json({ minLength: 8 });
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
    const minLength = Number(body.minLength) || 8;
    // ensure data dir exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    const payload = { minLength };
    await fs.writeFile(FILE, JSON.stringify(payload, null, 2), "utf-8");
    return NextResponse.json({ ok: true, ...payload });
  } catch {
    return new NextResponse(
      JSON.stringify({ ok: false, error: "Failed to save" }),
      { status: 500 },
    );
  }
}
