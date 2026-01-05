"use server";

import { db } from "@/lib/db";
import { fraudAccounts } from "@/lib/db/schema";
import { or, ilike, desc } from "drizzle-orm";

type FraudAccount = typeof fraudAccounts.$inferSelect;

// ค้นหาในฐานข้อมูลจริง
export async function searchFraudAccountFromDB(query: string): Promise<FraudAccount | null> {
  try {
    const normalizedQuery = query.replace(/-/g, "").trim();
    
    // ค้นหาจาก accountNumber, phoneNumber, หรือ accountName
    const results = await db
      .select()
      .from(fraudAccounts)
      .where(
        or(
          ilike(fraudAccounts.accountNumber, `%${normalizedQuery}%`),
          ilike(fraudAccounts.phoneNumber, `%${normalizedQuery}%`),
          ilike(fraudAccounts.accountName, `%${normalizedQuery}%`)
        )
      )
      .limit(1);
    
    return results[0] || null;
  } catch (error) {
    console.error("Database search error:", error);
    return null;
  }
}

// ดึงรายการบัญชีมิจฉาชีพทั้งหมด
export async function getAllFraudAccounts(): Promise<FraudAccount[]> {
  try {
    const results = await db
      .select()
      .from(fraudAccounts)
      .orderBy(desc(fraudAccounts.lastReportedAt));
    
    return results;
  } catch (error) {
    console.error("Database fetch error:", error);
    return [];
  }
}
