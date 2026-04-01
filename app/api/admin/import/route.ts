import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Expected CSV headers for fraud_accounts import
const REQUIRED_HEADERS = ["accountNumber", "bankName"];
const OPTIONAL_HEADERS = ["accountName", "phoneNumber", "status"];
const ALL_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Remove BOM if present
  const clean = text.replace(/^\uFEFF/, "").trim();
  const lines = clean.split(/\r?\n/).filter((l) => l.trim() !== "");

  if (lines.length < 2) throw new Error("ไฟล์ CSV ต้องมีอย่างน้อย 1 แถวข้อมูล");

// แยก CSV ทีละบรรทัด: รองรับการ quote ("") และ comma ในค่า
  const parseRow = (line: string): string[] => {
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // double-quote ("") ภายใน quoted field หมายถึง literal quote
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === "," && !inQuote) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim());

  // Validate required headers
  for (const req of REQUIRED_HEADERS) {
    if (!headers.includes(req)) {
      throw new Error(`ไฟล์ CSV ต้องมีคอลัมน์: ${REQUIRED_HEADERS.join(", ")}`);
    }
  }

  const rows = lines.slice(1).map((line) => {
    const cols = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    return row;
  });

  return { headers, rows };
}

// GET — download CSV template
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (req.nextUrl.searchParams.get("template") === "1") {
    const headers = ALL_HEADERS;
    const example = [
      "1234567890",
      "ธนาคารกสิกรไทย",
      "นาย ตัวอย่าง",
      "0812345678",
      "pending",
    ];
    const csv = "\uFEFF" + headers.join(",") + "\n" + example.join(",");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="fraud-accounts-template.csv"',
      },
    });
  }

  return NextResponse.json({ ok: false, error: "Use ?template=1 to download template" }, { status: 400 });
}

// POST — parse CSV and return preview (validate only, no DB write)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const isConfirm = req.nextUrl.searchParams.get("confirm") === "1";

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "ไม่พบไฟล์ CSV" }, { status: 400 });
    }

    const text = await (file as File).text();
    const { rows } = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลในไฟล์" }, { status: 400 });
    }

    if (rows.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "ไฟล์มีข้อมูลเกิน 5,000 แถว" },
        { status: 400 },
      );
    }

    // Validate each row has required fields
    const errors: string[] = [];
    rows.forEach((row, i) => {
      if (!row.accountNumber?.trim()) errors.push(`แถว ${i + 2}: ไม่มีเลขบัญชี (accountNumber)`);
      if (!row.bankName?.trim()) errors.push(`แถว ${i + 2}: ไม่มีชื่อธนาคาร (bankName)`);
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: "ข้อมูลไม่ถูกต้อง", details: errors.slice(0, 10) },
        { status: 422 },
      );
    }

    // ยังไม่กด confirm → แค่ preview ข้อมูล 5 แถวแรก ไม่เขียน DB
    if (!isConfirm) {
      return NextResponse.json({
        ok: true,
        preview: rows.slice(0, 5),
        total: rows.length,
      });
    }

    // กด confirm แล้ว → upsert ลง DB (มีอยู่=อัพเดท, ไม่มี=สร้างใหม่)
    const { fraudRepo } = await import("@/lib/db/repositories");
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const existing = await fraudRepo.findByAccountNumber(row.accountNumber);
      if (existing) {
        await fraudRepo.update(existing.id, {
          bankName: row.bankName || existing.bankName,
          accountName: row.accountName || existing.accountName,
          phoneNumber: row.phoneNumber || existing.phoneNumber,
          status: row.status || (existing.status ?? "pending"),
        });
        updated++;
      } else {
        await fraudRepo.create({
          accountNumber: row.accountNumber,
          bankName: row.bankName,
          accountName: row.accountName || null,
          phoneNumber: row.phoneNumber || null,
          status: row.status || "pending",
          reportCount: 0,
          totalDamage: "0",
        });
        inserted++;
      }
    }

    return NextResponse.json({ ok: true, inserted, updated, total: rows.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
