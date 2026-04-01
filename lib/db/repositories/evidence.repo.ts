import { db } from "@/lib/db";
import { reportEvidence } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin, EVIDENCE_BUCKET } from "@/lib/supabase";

export const evidenceRepo = {
  /**
   * บันทึก evidence file record ลง DB
   */
  async create(data: {
    reportId: string;
    fileUrl: string;
    fileType?: string | null;
    originalName?: string | null;
    fileSize?: number | null;
  }) {
    const [newEvidence] = await db
      .insert(reportEvidence)
      .values(data)
      .returning();
    return newEvidence;
  },

  /**
   * ดึง evidence ทั้งหมดของ report
   */
  async findByReportId(reportId: string) {
    return db
      .select()
      .from(reportEvidence)
      .where(eq(reportEvidence.reportId, reportId));
  },

  /**
   * ดึงรูปทั้งหมดของ report แล้ว convert เป็น base64 string[]
   * สำหรับใส่ใน PDF generation (evidence_images field)
   */
  async getBase64Images(reportId: string): Promise<string[]> {
    const records = await db
      .select()
      .from(reportEvidence)
      .where(eq(reportEvidence.reportId, reportId));

    // กรองเฉพาะ image files
    const imageRecords = records.filter((r) =>
      r.fileType?.startsWith("image/"),
    );

    const base64Images: string[] = [];

    for (const record of imageRecords) {
      try {
        // สร้าง signed URL ชั่วคราว 60 วิ พอสำหรับ download
        const { data: signedData } = await supabaseAdmin.storage
          .from(EVIDENCE_BUCKET)
          .createSignedUrl(record.fileUrl, 60);

        if (!signedData?.signedUrl) continue;

        // Fetch image และ convert เป็น base64
        const response = await fetch(signedData.signedUrl);
        if (!response.ok) continue;

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUri = `data:${record.fileType};base64,${base64}`;
        base64Images.push(dataUri);
      } catch (err) {
        console.error(`Failed to fetch evidence ${record.id}:`, err);
      }
    }

    return base64Images;
  },
};
