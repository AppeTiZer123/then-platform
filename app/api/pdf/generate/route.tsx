import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncidentReportDocument } from "@/lib/pdf/incident-report-template";
import type { IncidentReportData } from "@/types/pdf-report";

export async function POST(request: NextRequest) {
  try {
    const data: IncidentReportData = await request.json();

    // Validate required fields
    if (!data.fullname || !data.id_card || !data.incident_details) {
      return NextResponse.json(
        { error: "Missing required fields: fullname, id_card, incident_details" },
        { status: 400 }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <IncidentReportDocument data={data} />
    );

    // Create filename with date
    const filename = `ใบแจ้งเหตุ_${data.fullname}_${data.report_date || new Date().toLocaleDateString("th-TH")}.pdf`;

    // Return PDF file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint สำหรับ test ด้วย sample data
export async function GET() {
  const { sampleIncidentReportData } = await import("@/types/pdf-report");

  try {
    const pdfBuffer = await renderToBuffer(
      <IncidentReportDocument data={sampleIncidentReportData} />
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="sample-report.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}
