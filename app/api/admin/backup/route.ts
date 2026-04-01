import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// แปลง array of objects เป็น CSV string พร้อม BOM (เพื่อให้ Excel เปิดภาษาไทยถูก)
function toCSV(headers: string[], rows: Record<string, unknown>[]): string {
  // escape ค่าที่มี comma, newline, quote — ครอบด้วย double-quote
  const escape = (val: unknown): string => {
    const str = val == null ? "" : String(val);
    // Wrap in quotes if contains comma, newline, or quote
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escape).join(",");
  const dataRows = rows.map((r) => headers.map((h) => escape(r[h])).join(","));
  return "\uFEFF" + [headerRow, ...dataRows].join("\n");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "reports";

  try {
    if (type === "fraud-accounts") {
      const { fraudRepo } = await import("@/lib/db/repositories");
      const data = await fraudRepo.getAll();

      const headers = [
        "accountNumber",
        "bankName",
        "accountName",
        "phoneNumber",
        "reportCount",
        "totalDamage",
        "status",
        "lastReportedAt",
        "createdAt",
      ];

      const csv = toCSV(headers, data as unknown as Record<string, unknown>[]);
      const filename = `fraud-accounts-${new Date().toISOString().split("T")[0]}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // default: reports
    const { reportRepo } = await import("@/lib/db/repositories");
    const data = await reportRepo.getAll();

    const headers = [
      "caseNumber",
      "reporterName",
      "reporterPhone",
      "reporterEmail",
      "incidentDate",
      "incidentDetails",
      "damageAmount",
      "suspectPhone",
      "suspectSocialMedia",
      "status",
      "createdAt",
    ];

    const csv = toCSV(headers, data as unknown as Record<string, unknown>[]);
    const filename = `reports-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
