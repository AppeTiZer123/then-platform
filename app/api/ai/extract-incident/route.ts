import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { emptyIncidentReportData } from "@/types/pdf-report";

// Define schema for structured output validation
const incidentSchema = z.object({
  fullname: z.string().describe("ชื่อ-นามสกุล ของผู้เสียหาย"),
  age: z.string().describe("อายุ (ถ้ามีระบุ)"),
  id_card: z.string().describe("เลขบัตรประชาชน (ถ้ามีระบุ)"),
  phone: z.string().describe("เบอร์โทรศัพท์ผู้เสียหาย"),
  incident_details: z
    .string()
    .describe("รายละเอียดเหตุการณ์ที่เกิดขึ้น เรียบเรียงใหม่ให้เป็นภาษาทางการ"),
  asset_type: z
    .string()
    .describe("ประเภททรัพย์สินที่เสียหาย เช่น เงินสด, มือถือ"),
  asset_details: z
    .string()
    .describe("รายละเอียดการโอนเงิน เช่น ธนาคาร, เลขบัญชีปลายทาง"),
  asset_value: z.string().describe("มูลค่าความเสียหาย (บาท)"),
  asset_date: z.string().describe("วันที่เกิดเหตุ (เช่น 1 มกราคม 2569)"),
  asset_time: z.string().describe("เวลาที่เกิดเหตุ (เช่น 14:30)"),
  perpetrator_phone: z.string().describe("เบอร์โทรศัพท์คนร้าย (ถ้ามี)"),
  social_media_type: z
    .string()
    .describe("ช่องทางที่ติดต่อคนร้าย เช่น Facebook, Line"),
  social_media_url: z.string().describe("URL หรือ ID ของคนร้าย (ถ้ามี)"),

  // Bank account details of the suspect (specific extraction)
  suspect_account_number: z.string().describe("เลขบัญชีคนร้าย"),
  suspect_bank_name: z.string().describe("ธนาคารคนร้าย"),
  suspect_account_name: z.string().describe("ชื่อบัญชีคนร้าย"),
  suspect_id_card_number: z.string().describe("เลขบัตรประชาชนคนร้าย (ถ้ามีระบุในเรื่องเล่า)"),

  // Checkbox fields for PDF
  case_type: z.string().describe(
    `ประเภทคดีที่ตรงที่สุดจากรายการต่อไปนี้ ต้องตอบเป็น string ที่ตรงกันพอดี:
      - "คดีไม่เข้าข่ายตาม พ.ร.ก."
      - "หลอกลวงซื้อขายสินค้าหรือบริการ ที่ไม่มีลักษณะเป็นขบวนการ"
      - "หลอกลวงเป็นบุคคลอื่นเพื่อยืมเงิน"
      - "หลอกลวงให้รักแล้วโอนเงิน"
      - "หลอกลวงให้โอนเงินเพื่อรับรางวัลหรือวัตถุประสงค์อื่นๆ"
      - "หลอกลวงให้กู้เงินอันมีลักษณะฉ้อโกง กรรโชก หรือรีดเอาทรัพย์"
      - "หลอกลวงให้โอนเงินเพื่อทำงานหารายได้พิเศษ"
      - "ข่มขู่ทางโทรศัพท์ให้เกิดความกลัวและหลอกให้โอนเงิน"
      - "หลอกลวงให้ติดตั้งโปรแกรมควบคุมระบบในโทรศัพท์"
      - "หลอกลวงให้ลงทุนผ่านระบบคอมพิวเตอร์"
      - "หลอกลวงเกี่ยวกับสินทรัพย์ดิจิทัล"
      - "หลอกลวงซื้อขายสินค้าหรือบริการ ที่มีลักษณะเป็นกระบวนการ"
      - "คดีอาชญากรรมทางเทคโนโลยีทางลักษณะอื่นๆ"`,
  ),
  met_investigator: z
    .boolean()
    .describe(
      "ผู้แจ้งเคยไปพบพนักงานสอบสวน/แจ้งความที่สถานีตำรวจแล้วหรือยัง (true = เคยแล้ว, false = ยังไม่เคย)",
    ),
});

export async function POST(req: NextRequest) {
  try {
    const { story, contactInfo } = await req.json();

    if (!story) {
      return NextResponse.json({ error: "Story is required" }, { status: 400 });
    }

    // Use Gemini to extract data
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: incidentSchema,
      prompt: `
วิเคราะห์ข้อความต่อไปนี้ ซึ่งเป็นเรื่องราวการถูกหลอกลวงออนไลน์ และสกัดข้อมูลออกมาเป็น JSON เพื่อนำไปลงบันทึกประจำวัน
**สำคัญมาก:** ต้องแยกแยะระหว่าง "ผู้เสียหาย" (ผู้แจ้ง) กับ "คนร้าย" (คู่กรณี) ให้ชัดเจน ห้ามสลับกันเด็ดขาด

ข้อมูลผู้แจ้ง (ผู้เสียหาย):
ชื่อ: ${contactInfo?.name || "ไม่ระบุ"}
เบอร์โทร: ${contactInfo?.phone || "ไม่ระบุ"}
อีเมล: ${contactInfo?.email || "ไม่ระบุ"}

เรื่องราวที่ผู้แจ้งเล่า:
"${story}"

คำแนะนำในการสกัดข้อมูล:
1. **fullname**: คือชื่อของผู้แจ้ง (ผู้เสียหาย) เท่านั้น ห้ามเอาชื่อบัญชีคนร้ายมาใส่
2. **incident_details**: เรียบเรียงเรื่องราวใหม่ให้เป็นภาษาทางการ (เช่น "ข้าพเจ้าได้ทำการ...")
3. **asset_details**: รายละเอียดการโอนเงิน ให้ระบุว่า "โอนจากบัญชีธนาคาร... ของผู้แจ้ง ไปยังบัญชีธนาคาร... เลขที่... ชื่อบัญชี..." 
4. **ข้อมูลคนร้าย (Suspect)**:
   - judge จากบริบทว่าใครคือคนร้าย (ผู้ที่ได้รับเงิน, ผู้ที่บล็อคการติดต่อ)
   - **suspect_account_name**: ชื่อเจ้าของบัญชีปลายทางที่โอนเงินไป (ห้ามใช้ชื่อผู้แจ้ง เว้นแต่ผู้แจ้งจะโอนเข้าบัญชีตัวเอง)
   - **suspect_bank_name**: ธนาคารปลายทาง
   - **suspect_account_number**: เลขบัญชีปลายทาง
   - **social_media_type/url**: ช่องทางที่คนร้ายใช้ติดต่อ
`,
    });

    // รวม template เปล่า + ข้อมูลที่ AI สกัด เพื่อรับประกันว่าทุก field มีค่าเสมอ (แม้ AI ส่งมาไม่ครบ)
    const finalData = {
      ...emptyIncidentReportData,
      fullname: object.fullname || contactInfo?.name || "",
      id_card: contactInfo?.idCard || object.id_card || "",
      phone: object.phone || contactInfo?.phone || "",
      email: contactInfo?.email || "",

      // Mapped fields
      incident_details: object.incident_details,
      asset_type: object.asset_type || "เงินสด",
      asset_details: object.asset_details,
      asset_value: object.asset_value,
      asset_date: object.asset_date,
      asset_time: object.asset_time,

      // Suspect info mapping
      perpetrator_phone: object.perpetrator_phone,
      received_phone: object.phone || contactInfo?.phone || "",

      social_media_type: object.social_media_type,
      social_media_url: object.social_media_url,

      // Checkbox fields
      case_type: object.case_type,
      met_investigator: object.met_investigator,

      report_date: new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),

      // Additional fields that might be useful for rendering but not in standard schema validation
      // You can add logic here to put suspect bank info into a specific format string if needed
    };

    // ถ้า AI ดึงข้อมูลบัญชีคนร้ายได้ แต่ยังไม่มีใน incident_details → เติมเข้าไปท้ายข้อความ
    if (object.suspect_account_number || object.suspect_bank_name) {
      const bankInfo = `\n\nข้อมูลบัญชีคนร้าย: ${object.suspect_bank_name || ""} เลขที่ ${object.suspect_account_number || ""} ชื่อ ${object.suspect_account_name || ""}`;
      if (!finalData.incident_details.includes(object.suspect_account_number)) {
        finalData.incident_details += bankInfo;
      }
      // Also update asset details
      if (!finalData.asset_details.includes(object.suspect_account_number)) {
        finalData.asset_details = `${object.suspect_bank_name || ""} เลข ${object.suspect_account_number || ""} (${object.suspect_account_name || ""})`;
      }
    }

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract data", details: String(error) },
      { status: 500 },
    );
  }
}
