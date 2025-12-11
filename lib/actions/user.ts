'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// =============================================
// User Service - สำหรับจัดการ users
// =============================================

/**
 * Normalize เบอร์โทร - ลบเครื่องหมาย - และ space ออก
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[-\s()]/g, '').trim();
}

/**
 * ค้นหา user จาก phone
 */
export async function findUserByPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, normalizedPhone))
    .limit(1);
  
  return result[0] || null;
}

/**
 * ค้นหา user จาก id
 */
export async function findUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return result[0] || null;
}

/**
 * สร้าง user ใหม่ หรือ return ที่มีอยู่แล้ว
 */
export async function findOrCreateUser(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  
  // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
  const existingUser = await findUserByPhone(normalizedPhone);
  
  if (existingUser) {
    return existingUser;
  }
  
  // สร้าง user ใหม่ (เก็บเบอร์แบบ normalized)
  const [newUser] = await db
    .insert(users)
    .values({
      phone: normalizedPhone,
      isVerified: true,
    })
    .returning();
  
  return newUser;
}

/**
 * อัปเดตข้อมูล user (สำหรับ complete profile)
 */
export async function updateUserProfile(id: string, data: {
  name?: string;
  email?: string;
  idCardEncrypted?: string;
  address?: string;
}) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  
  return updated;
}

/**
 * อัปเดตข้อมูล user (legacy)
 */
export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  address?: string;
}) {
  return updateUserProfile(id, data);
}
