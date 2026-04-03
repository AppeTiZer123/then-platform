import { db } from "@/lib/db";
import { reports, officers, users } from "@/lib/db/schema";
import { count as sqlCount, desc, eq, getTableColumns } from "drizzle-orm";

type Report = typeof reports.$inferSelect;

/**
 * Report Repository - รวม query methods สำหรับ reports table
 */
export const reportRepo = {
  /**
   * ค้นหา report จาก ID
   */
  async findById(id: string): Promise<Report | null> {
    const results = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    return results[0] || null;
  },

  /**
   * ดึง report ทั้งหมด พร้อมชื่อเจ้าหน้าที่ที่ได้รับมอบหมาย
   */
  async getAll() {
    return db
      .select({
        ...getTableColumns(reports),
        assignedOfficerName: users.name,
      })
      .from(reports)
      .leftJoin(officers, eq(reports.assignedOfficerId, officers.id))
      .leftJoin(users, eq(officers.userId, users.id))
      .orderBy(desc(reports.createdAt));
  },

  /**
   * สร้าง report ใหม่
   */
  async create(data: {
    caseNumber: string;
    reporterName: string;
    reporterPhone: string;
    reporterId?: string | null;
    reporterEmail?: string | null;
    incidentDate: string;
    incidentDetails: string;
    damageAmount?: string;
    suspectFraudAccountId?: string | null;
    suspectPhone?: string | null;
    suspectSocialMedia?: string | null;
    status?: string;
    aiGeneratedDocument?: Record<string, unknown> | null;
  }) {
    const [newReport] = await db.insert(reports).values(data).returning();
    return newReport;
  },

  /**
   * ค้นหา report จาก case number (รวม ai_generated_document สำหรับ re-download)
   */
  async findByCaseNumber(caseNumber: string) {
    const results = await db
      .select()
      .from(reports)
      .where(eq(reports.caseNumber, caseNumber.trim().toUpperCase()))
      .limit(1);
    return results[0] || null;
  },

  /**
   * นับจำนวน reports ทั้งหมด — ใช้ SQL COUNT(*) เพื่อสร้าง case number ลำดับถัดไป
   */
  async count(): Promise<number> {
    const [{ value }] = await db.select({ value: sqlCount() }).from(reports);
    return value;
  },

  /**
   * อัพเดท report status
   */
  async updateStatus(id: string, status: string) {
    const [updated] = await db
      .update(reports)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    return updated;
  },

  /**
   * มอบหมายเจ้าหน้าที่ให้ report + เปลี่ยน status เป็น in_progress อัตโนมัติ
   */
  async assignOfficer(reportId: string, officerId: string) {
    const [updated] = await db
      .update(reports)
      .set({
        assignedOfficerId: officerId,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();

    return updated ?? null;
  },
};

export type ReportRepo = typeof reportRepo;
