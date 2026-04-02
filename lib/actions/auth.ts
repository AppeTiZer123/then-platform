"use server";

import { createHash } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpVerifications } from "@/lib/db/schema";
import { findUserById } from "./user";
import { sendSms } from "@/lib/sms-service";

// แปลง OTP เป็น SHA-256 hash เพื่อไม่เก็บ OTP ตัวจริงใน DB (ป้องกันข้อมูลรั่ว)
function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function requestOTP(
  phone: string,
): Promise<{ success: boolean; message: string }> {
  if (!phone || phone.trim().length < 9) {
    return { success: false, message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" };
  }

  // สุ่มรหัส 6 หลัก (100000-999999) พร้อมกำหนดหมดอายุ 5 นาที
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 1. บันทึก OTP ลง DB ก่อน — ถ้า DB พัง จะได้ไม่เสีย SMS เปล่า
  let otpRecordId: string;
  try {
    const [record] = await db
      .insert(otpVerifications)
      .values({
        phone,
        otpCodeHash: hashOtp(code),
        expiresAt,
      })
      .returning({ id: otpVerifications.id });

    otpRecordId = record.id;
  } catch (err) {
    console.error("Failed to save OTP to database:", err);
    return { success: false, message: "ระบบขัดข้อง ไม่สามารถสร้าง OTP ได้ กรุณาลองใหม่" };
  }

  // 2. ส่ง SMS — ถ้าส่งไม่ได้ ให้ mark record เป็น used เพื่อ invalidate
  try {
    await sendSms(phone, `รหัส OTP ของคุณคือ ${code} (หมดอายุใน 5 นาที)`);
  } catch (err) {
    console.error("Failed to send SMS:", err);
    // Invalidate OTP record ที่สร้างไว้
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, otpRecordId));
    return { success: false, message: "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่" };
  }

  return { success: true, message: "ส่ง OTP แล้ว" };
}

export async function verifyOTP(
  phone: string,
  otp: string,
): Promise<{ success: boolean; message: string }> {
  if (!phone || !otp) {
    return { success: false, message: "ข้อมูลไม่ครบ" };
  }

  // ค้นหา OTP ที่ตรงเบอร์ + hash ตรงกัน + ยังไม่ถูกใช้ + ยังไม่หมดอายุ
  const record = await db.query.otpVerifications.findFirst({
    where: and(
      eq(otpVerifications.phone, phone),
      eq(otpVerifications.otpCodeHash, hashOtp(otp)),
      eq(otpVerifications.isUsed, false),
      gt(otpVerifications.expiresAt, new Date()),
    ),
  });

  if (!record) {
    return { success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" };
  }

  await db
    .update(otpVerifications)
    .set({ isUsed: true })
    .where(eq(otpVerifications.id, record.id));

  return { success: true, message: "OTP ถูกต้อง" };
}

export async function getUserById(id: string) {
  return findUserById(id);
}
