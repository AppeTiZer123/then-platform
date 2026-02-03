import { db } from "@/lib/db";
import { users, type NewUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Normalize เบอร์โทร - ลบ -, spaces, ()
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[-\s()]/g, "").trim();
}

/**
 * User Repository - รวม query methods สำหรับ users table
 */
export const userRepo = {
  /**
   * ค้นหา user จาก ID
   */
  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  },

  /**
   * ค้นหา user จากเบอร์โทร
   */
  async findByPhone(phone: string) {
    const normalizedPhone = normalizePhone(phone);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);

    return result[0] || null;
  },

  /**
   * สร้าง user ใหม่
   */
  async create(data: NewUser) {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
  },

  /**
   * อัพเดท user
   */
  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      idCardEncrypted?: string;
      address?: string;
    },
  ) {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  },

  /**
   * ค้นหาหรือสร้าง user ใหม่
   */
  async findOrCreate(phone: string) {
    const normalizedPhone = normalizePhone(phone);

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await this.findByPhone(normalizedPhone);

    if (existingUser) {
      return existingUser;
    }

    // สร้าง user ใหม่
    return this.create({
      phone: normalizedPhone,
      isVerified: true,
    });
  },
};

export type UserRepo = typeof userRepo;
