import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncidentReportDocument } from "@/lib/pdf/incident-report-template";
import { reportRepo, evidenceRepo } from "@/lib/db/repositories";
import type { IncidentReportData } from "@/types/pdf-report";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;

  const report = await reportRepo.findById(reportId);
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!report.aiGeneratedDocument) {
    return NextResponse.json(
      { error: "ไม่พบข้อมูลเอกสาร AI สำหรับ report นี้" },
      { status: 404 },
    );
  }

  // ดึงรูปหลักฐานจาก Supabase Storage → แปลงเป็น base64 เพื่อฝังใน PDF
  const evidenceImages = await evidenceRepo.getBase64Images(reportId);

  // รวมข้อมูล AI + รูปหลักฐานเป็น object เดียวสำหรับ render PDF
  const pdfData: IncidentReportData = {
    ...(report.aiGeneratedDocument as unknown as IncidentReportData),
    evidence_images: evidenceImages,
  };

  try {
    const document = <IncidentReportDocument data={pdfData} />;
    const pdfBuffer = await renderToBuffer(document);

    const filename = `ใบแจ้งความ_${report.caseNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("PDF re-generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 },
    );
  }
}
