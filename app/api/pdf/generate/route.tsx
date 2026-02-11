import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncidentReportDocument } from "@/lib/pdf/incident-report-template";
import type { IncidentReportData } from "@/types/pdf-report";

export async function POST(request: NextRequest) {
  let data: IncidentReportData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!data.fullname || !data.incident_details) {
    return NextResponse.json(
      { error: "Missing required fields: fullname, incident_details" },
      { status: 400 }
    );
  }

  // Generate PDF buffer - Construct JSX outside try/catch
  const document = <IncidentReportDocument data={data} />;

  try {
    const pdfBuffer = await renderToBuffer(document);

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
  
  const document = <IncidentReportDocument data={sampleIncidentReportData} />;

  try {
    const pdfBuffer = await renderToBuffer(document);

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
