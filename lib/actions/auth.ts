'use server';

import { signIn } from "@/lib/auth";
import { findOrCreateUser, findUserById } from "./user";

// Mock OTP - จะเปลี่ยนเป็น OTP จริงในอนาคต
const MOCK_OTP = "123456";

// เก็บ pending phone สำหรับ OTP flow (ในอนาคตใช้ Redis/DB)
const pendingPhones = new Map<string, { phone: string; expiresAt: Date }>();

/**
 * ขอ OTP สำหรับเบอร์โทร
 */
export async function requestOTP(phone: string): Promise<{ success: boolean; message: string }> {
  if (!phone || phone.trim().length < 9) {
    return { success: false, message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" };
  }

  // เก็บ pending phone
  pendingPhones.set(phone, {
    phone,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 นาที
  });

  // ในอนาคตส่ง SMS จริง
  console.log(`[Mock] OTP sent to ${phone}: ${MOCK_OTP}`);

  return { success: true, message: "ส่ง OTP แล้ว" };
}

/**
 * ยืนยัน OTP และ login
 */
export async function verifyOTPAndLogin(phone: string, otp: string): Promise<{ 
  success: boolean; 
  message: string;
  isNewUser?: boolean;
}> {
  if (!phone || !otp) {
    return { success: false, message: "ข้อมูลไม่ครบ" };
  }

  // ตรวจสอบ pending phone
  const pending = pendingPhones.get(phone);
  
  if (!pending) {
    return { success: false, message: "กรุณาขอ OTP ใหม่" };
  }
  
  if (pending.expiresAt < new Date()) {
    pendingPhones.delete(phone);
    return { success: false, message: "OTP หมดอายุ กรุณาขอใหม่" };
  }

  // ตรวจสอบ OTP
  if (otp !== MOCK_OTP) {
    return { success: false, message: "รหัส OTP ไม่ถูกต้อง" };
  }

  // ลบ pending phone
  pendingPhones.delete(phone);

  // สร้างหรือดึง user จาก DB
  const user = await findOrCreateUser(phone);
  
  // ใช้ signIn ของ NextAuth - ไม่ต้องส่ง OTP ไปแล้ว เพราะ validate แล้ว
  try {
    await signIn("otp", {
      phone,
      redirect: false,
    });
    
    return { 
      success: true, 
      message: "เข้าสู่ระบบสำเร็จ",
      isNewUser: !user.name
    };
  } catch (error) {
    console.error("SignIn error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
}

/**
 * ดึงข้อมูล user จาก ID
 */
export async function getUserById(id: string) {
  return findUserById(id);
}
