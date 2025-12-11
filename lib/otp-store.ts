// เก็บ pending phone สำหรับ OTP flow (ในอนาคตใช้ Redis/DB)
// Export ให้ใช้ร่วมกันได้
export const pendingPhones = new Map<string, { phone: string; expiresAt: Date }>();

// Mock OTP - จะเปลี่ยนเป็น OTP จริงในอนาคต
export const MOCK_OTP = "123456";

/**
 * เพิ่ม pending phone
 */
export function addPendingPhone(phone: string): void {
  pendingPhones.set(phone, {
    phone,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 นาที
  });
}

/**
 * ตรวจสอบ pending phone
 */
export function getPendingPhone(phone: string): { phone: string; expiresAt: Date } | undefined {
  return pendingPhones.get(phone);
}

/**
 * ลบ pending phone
 */
export function removePendingPhone(phone: string): void {
  pendingPhones.delete(phone);
}

/**
 * ตรวจสอบว่า OTP ถูกต้องและยังไม่หมดอายุ
 */
export function validateOTP(phone: string, otp: string): { valid: boolean; message: string } {
  const pending = pendingPhones.get(phone);
  
  if (!pending) {
    return { valid: false, message: "กรุณาขอ OTP ใหม่" };
  }
  
  if (pending.expiresAt < new Date()) {
    pendingPhones.delete(phone);
    return { valid: false, message: "OTP หมดอายุ กรุณาขอใหม่" };
  }
  
  if (otp !== MOCK_OTP) {
    return { valid: false, message: "รหัส OTP ไม่ถูกต้อง" };
  }
  
  // ลบหลังจาก validate สำเร็จ
  pendingPhones.delete(phone);
  return { valid: true, message: "OTP ถูกต้อง" };
}
