import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reportRepo, fraudRepo } from "@/lib/db/repositories";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: {
    extractedData: Record<string, string | boolean>;
    contactInfo: { name: string; phone: string; email?: string };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { extractedData, contactInfo } = body;

  if (!extractedData || !contactInfo) {
    return NextResponse.json(
      { ok: false, error: "Missing extractedData or contactInfo" },
      { status: 400 },
    );
  }

  try {
    // 1. Generate case number (server-side, safe)
    const year = new Date().getFullYear();
    const reportCount = await reportRepo.count();
    const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
    const caseNumber = `RPT-${year}-${String(reportCount + 1).padStart(4, "0")}-${suffix}`;

    // 2. Resolve suspect fraud account
    let fraudAccountId: string | null = null;
    const suspectAccountNumber = extractedData.suspect_account_number as string;
    const suspectBankName = extractedData.suspect_bank_name as string;
    const suspectAccountName = extractedData.suspect_account_name as string;
    const suspectPhone = extractedData.perpetrator_phone as string;
    const damageAmount =
      parseFloat(
        String(extractedData.asset_value || "0").replace(/[^0-9.]/g, ""),
      ) || 0;

    if (suspectAccountNumber && suspectBankName) {
      const existing =
        await fraudRepo.findByAccountNumber(suspectAccountNumber);

      if (existing) {
        fraudAccountId = existing.id;
        await fraudRepo.updateReportStats(suspectAccountNumber, {
          reportCount: (existing.reportCount || 0) + 1,
          totalDamage: String(
            parseFloat(existing.totalDamage || "0") + damageAmount,
          ),
        });
      } else {
        const newAccount = await fraudRepo.create({
          accountNumber: suspectAccountNumber,
          bankName: suspectBankName,
          accountName: suspectAccountName || null,
          phoneNumber: suspectPhone || null,
          reportCount: 1,
          totalDamage: String(damageAmount),
          status: "pending",
        });
        fraudAccountId = newAccount.id;
      }
    }

    // 3. Resolve incidentDate — ต้องเป็น YYYY-MM-DD
    const rawDate = String(extractedData.asset_date || "");
    let incidentDate = new Date().toISOString().split("T")[0];
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        incidentDate = parsed.toISOString().split("T")[0];
      }
    }

    // 4. Save report
    const newReport = await reportRepo.create({
      caseNumber,
      reporterId: session.user.id ?? null,
      reporterName:
        contactInfo.name || String(extractedData.fullname || "ไม่ระบุ"),
      reporterPhone: contactInfo.phone || String(extractedData.phone || ""),
      reporterEmail: contactInfo.email || null,
      incidentDate,
      incidentDetails: String(extractedData.incident_details || ""),
      damageAmount: damageAmount > 0 ? String(damageAmount) : "0",
      suspectFraudAccountId: fraudAccountId,
      suspectPhone: suspectPhone || null,
      suspectSocialMedia: extractedData.social_media_url
        ? `${extractedData.social_media_type || ""}: ${extractedData.social_media_url}`
        : null,
      status: "completed",
      aiGeneratedDocument: extractedData as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true, caseNumber, reportId: newReport.id });
  } catch (error) {
    console.error("Save report error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save report" },
      { status: 500 },
    );
  }
}
