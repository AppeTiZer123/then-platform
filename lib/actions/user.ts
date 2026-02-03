"use server";

import { userRepo } from "@/lib/db/repositories";

/**
 * ค้นหา user จากเบอร์โทร
 */
export async function findUserByPhone(phone: string) {
  return userRepo.findByPhone(phone);
}

/**
 * ค้นหา user จาก id
 */
export async function findUserById(id: string) {
  return userRepo.findById(id);
}

/**
 * สร้าง user ใหม่ หรือ return ที่มีอยู่แล้ว
 */
export async function findOrCreateUser(phone: string) {
  return userRepo.findOrCreate(phone);
}

/**
 * อัปเดตข้อมูล user (สำหรับ complete profile)
 */
export async function updateUserProfile(
  id: string,
  data: {
    name?: string;
    email?: string;
    idCardEncrypted?: string;
    address?: string;
  },
) {
  return userRepo.update(id, data);
}

/**
 * อัปเดตข้อมูล user (legacy)
 */
export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    address?: string;
  },
) {
  return updateUserProfile(id, data);
}
