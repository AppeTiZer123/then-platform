import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

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
   * ดึง report ทั้งหมด
   */
  async getAll(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
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
  }) {
    const [newReport] = await db.insert(reports).values(data).returning();
    return newReport;
  },

  /**
   * นับจำนวน reports ทั้งหมด (สำหรับ generate case number)
   */
  async count(): Promise<number> {
    const results = await db.select().from(reports);
    return results.length;
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
};

export type ReportRepo = typeof reportRepo;
