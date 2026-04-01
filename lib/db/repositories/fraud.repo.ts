import { db } from "@/lib/db";
import { fraudAccounts } from "@/lib/db/schema";
import { or, ilike, desc, eq } from "drizzle-orm";

/** ป้องกัน SQL Injection ผ่าน LIKE wildcard — escape ตัว %, _ และ \\ ที่เป็นอักขระพิเศษใน LIKE pattern */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

type FraudAccount = typeof fraudAccounts.$inferSelect;

/**
 * Fraud Repository - รวม query methods สำหรับ fraudAccounts table
 */
export const fraudRepo = {
  /**
   * ค้นหาบัญชีมิจฉาชีพจาก query string
   */
  async search(query: string): Promise<FraudAccount | null> {
    // ลบขีด (-) และ escape wildcard ก่อนค้น เพื่อให้จับคู่ได้ทั้งรูปแบบมีขีดและไม่มีขีด
    const normalizedQuery = escapeLike(query.replace(/-/g, "").trim());

    const results = await db
      .select()
      .from(fraudAccounts)
      .where(
        or(
          ilike(fraudAccounts.accountNumber, `%${normalizedQuery}%`),
          ilike(fraudAccounts.phoneNumber, `%${normalizedQuery}%`),
          ilike(fraudAccounts.accountName, `%${normalizedQuery}%`),
        ),
      )
      .limit(1);

    return results[0] || null;
  },

  /**
   * ดึงบัญชีมิจฉาชีพทั้งหมด
   */
  async getAll(): Promise<FraudAccount[]> {
    return db
      .select()
      .from(fraudAccounts)
      .orderBy(desc(fraudAccounts.lastReportedAt));
  },

  /**
   * ค้นหาบัญชีจาก account number
   */
  async findByAccountNumber(
    accountNumber: string,
  ): Promise<FraudAccount | null> {
    const results = await db
      .select()
      .from(fraudAccounts)
      .where(eq(fraudAccounts.accountNumber, accountNumber))
      .limit(1);

    return results[0] || null;
  },

  /**
   * สร้างบัญชีมิจฉาชีพใหม่
   */
  async create(data: {
    accountNumber: string;
    bankName: string;
    accountName?: string | null;
    phoneNumber?: string | null;
    reportCount?: number;
    totalDamage?: string;
    status?: string;
  }) {
    const [newAccount] = await db
      .insert(fraudAccounts)
      .values({
        ...data,
        lastReportedAt: new Date(),
      })
      .returning();

    return newAccount;
  },

  /**
   * อัพเดท report count และ total damage
   */
  async updateReportStats(
    accountNumber: string,
    data: {
      reportCount: number;
      totalDamage: string;
    },
  ) {
    const [updated] = await db
      .update(fraudAccounts)
      .set({
        reportCount: data.reportCount,
        totalDamage: data.totalDamage,
        lastReportedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(ilike(fraudAccounts.accountNumber, accountNumber))
      .returning();

    return updated;
  },

  /**
   * อัพเดทข้อมูลบัญชีทั่วไป (admin)
   */
  async update(
    id: string,
    data: {
      accountNumber?: string;
      bankName?: string;
      accountName?: string | null;
      phoneNumber?: string | null;
      reportCount?: number;
      totalDamage?: string;
      status?: string;
    },
  ) {
    const [updated] = await db
      .update(fraudAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fraudAccounts.id, id))
      .returning();
    return updated;
  },

  /**
   * ลบบัญชีมิจฉาชีพออกจาก DB
   */
  async delete(id: string) {
    await db.delete(fraudAccounts).where(eq(fraudAccounts.id, id));
  },
};

export type FraudRepo = typeof fraudRepo;
