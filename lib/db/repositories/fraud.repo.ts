import { db } from "@/lib/db";
import { fraudAccounts } from "@/lib/db/schema";
import { or, ilike, desc } from "drizzle-orm";

type FraudAccount = typeof fraudAccounts.$inferSelect;

/**
 * Fraud Repository - รวม query methods สำหรับ fraudAccounts table
 */
export const fraudRepo = {
  /**
   * ค้นหาบัญชีมิจฉาชีพจาก query string
   */
  async search(query: string): Promise<FraudAccount | null> {
    const normalizedQuery = query.replace(/-/g, "").trim();

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
      .where(ilike(fraudAccounts.accountNumber, accountNumber))
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
};

export type FraudRepo = typeof fraudRepo;
