"use server";

import { createHash } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpVerifications } from "@/lib/db/schema";
import { findUserById } from "./user";
import { sendSms } from "@/lib/sms-service";

function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function requestOTP(
  phone: string,
): Promise<{ success: boolean; message: string }> {
  if (!phone || phone.trim().length < 9) {
    return { success: false, message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await sendSms(phone, `รหัส OTP ของคุณคือ ${code} (หมดอายุใน 5 นาที)`);
  } catch (err) {
    console.error("Failed to send SMS:", err);
    return { success: false, message: "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่" };
  }

  await db.insert(otpVerifications).values({
    phone,
    otpCodeHash: hashOtp(code),
    expiresAt,
  });

  return { success: true, message: "ส่ง OTP แล้ว" };
}

export async function verifyOTP(
  phone: string,
  otp: string,
): Promise<{ success: boolean; message: string }> {
  if (!phone || !otp) {
    return { success: false, message: "ข้อมูลไม่ครบ" };
  }

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
