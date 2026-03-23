"use server";

import { fraudRepo, reportRepo } from "@/lib/db/repositories";

type FraudAccount = Awaited<ReturnType<typeof fraudRepo.getAll>>[number];

/**
 * ค้นหาบัญชีมิจฉาชีพจาก DB
 */
export async function searchFraudAccountFromDB(
  query: string,
): Promise<FraudAccount | null> {
  try {
    return await fraudRepo.search(query);
  } catch (error) {
    console.error("Database search error:", error);
    return null;
  }
}

/**
 * ดึงรายการบัญชีมิจฉาชีพทั้งหมด
 */
export async function getAllFraudAccounts(): Promise<FraudAccount[]> {
  try {
    return await fraudRepo.getAll();
  } catch (error) {
    console.error("Database fetch error:", error);
    return [];
  }
}

// Quick Report - บันทึกรายงานแบบย่อจากหน้า AI Chat
export interface QuickReportData {
  reporterName?: string;
  reporterPhone?: string;
  incidentDetails: string;
  damageAmount?: number;
  suspectAccountNumber?: string;
  suspectBankName?: string;
  suspectAccountName?: string;
  suspectPhone?: string;
  suspectSocialMedia?: string;
}

export interface QuickReportResult {
  success: boolean;
  caseNumber?: string;
  message: string;
}

export async function createQuickReport(
  data: QuickReportData,
): Promise<QuickReportResult> {
  try {
    // 1. Generate case number — ใช้ COUNT(*) แทน getAll() เพื่อ performance
    //    และใช้ crypto.randomUUID() suffix เพื่อป้องกัน race condition
    const year = new Date().getFullYear();
    const reportCount = await reportRepo.count();
    const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
    const caseNumber = `QR-${year}-${String(reportCount + 1).padStart(4, "0")}-${suffix}`;

    // 2. ถ้ามีข้อมูลบัญชีผู้ต้องสงสัย ให้สร้างหรืออัพเดท fraud_account
    let fraudAccountId: string | null = null;

    if (data.suspectAccountNumber && data.suspectBankName) {
      // ตรวจสอบว่ามีบัญชีนี้อยู่แล้วหรือไม่
      const existingAccount = await fraudRepo.findByAccountNumber(
        data.suspectAccountNumber,
      );

      if (existingAccount) {
        // อัพเดท report count และ total damage
        fraudAccountId = existingAccount.id;
        const newReportCount = (existingAccount.reportCount || 0) + 1;
        const newTotalDamage =
          parseFloat(existingAccount.totalDamage || "0") +
          (data.damageAmount || 0);

        await fraudRepo.updateReportStats(data.suspectAccountNumber, {
          reportCount: newReportCount,
          totalDamage: String(newTotalDamage),
        });
      } else {
        // สร้าง fraud_account ใหม่
        const newAccount = await fraudRepo.create({
          accountNumber: data.suspectAccountNumber,
          bankName: data.suspectBankName,
          accountName: data.suspectAccountName || null,
          phoneNumber: data.suspectPhone || null,
          reportCount: 1,
          totalDamage: String(data.damageAmount || 0),
          status: "pending",
        });

        fraudAccountId = newAccount.id;
      }
    }

    // 3. สร้าง report ใหม่
    await reportRepo.create({
      caseNumber,
      reporterName: data.reporterName || "ไม่ระบุ",
      reporterPhone: data.reporterPhone || "",
      incidentDate: new Date().toISOString().split("T")[0],
      incidentDetails: data.incidentDetails,
      damageAmount: data.damageAmount ? String(data.damageAmount) : "0",
      suspectFraudAccountId: fraudAccountId,
      suspectPhone: data.suspectPhone || null,
      suspectSocialMedia: data.suspectSocialMedia || null,
      status: "tip", // แจ้งเบาะแส (ยังไม่ออกเอกสาร)
    });

    return {
      success: true,
      caseNumber,
      message: `บันทึกข้อมูลเรียบร้อยแล้ว หมายเลขอ้างอิง: ${caseNumber}`,
    };
  } catch (error) {
    console.error("Quick report error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function createFraudAccount(data: {
  accountNumber: string;
  bankName: string;
  accountName?: string;
  phoneNumber?: string;
  reportCount?: number;
  totalDamage?: number;
  status?: string;
}): Promise<{ success: boolean; account?: FraudAccount; error?: string }> {
  try {
    const account = await fraudRepo.create({
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      accountName: data.accountName || null,
      phoneNumber: data.phoneNumber || null,
      reportCount: data.reportCount || 0,
      totalDamage: String(data.totalDamage || 0),
      status: data.status || "pending",
    });
    return { success: true, account };
  } catch (error) {
    console.error("Create fraud account error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateFraudAccount(
  id: string,
  data: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    phoneNumber?: string;
    reportCount?: number;
    totalDamage?: number;
    status?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await fraudRepo.update(id, {
      ...data,
      accountName:
        data.accountName !== undefined ? data.accountName || null : undefined,
      phoneNumber:
        data.phoneNumber !== undefined ? data.phoneNumber || null : undefined,
      totalDamage:
        data.totalDamage !== undefined ? String(data.totalDamage) : undefined,
    });
    return { success: true };
  } catch (error) {
    console.error("Update fraud account error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteFraudAccount(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await fraudRepo.delete(id);
    return { success: true };
  } catch (error) {
    console.error("Delete fraud account error:", error);
    return { success: false, error: String(error) };
  }
}
