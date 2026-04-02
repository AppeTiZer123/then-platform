import { db } from "@/lib/db";
import { officers, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

type Officer = typeof officers.$inferSelect;

type CreateOfficerData = {
  userId?: string | null;
  rank?: string | null;
  department?: string | null;
  isActive?: boolean;
};

type UpdateOfficerData = {
  userId?: string | null;
  rank?: string | null;
  department?: string | null;
  isActive?: boolean;
};

/**
 * Officer Repository — query methods สำหรับ officers table
 */
export const officerRepo = {
  /**
   * ดึง officers ที่ active ทั้งหมด
   */
  async getAll(): Promise<Officer[]> {
    return db
      .select()
      .from(officers)
      .orderBy(desc(officers.createdAt));
  },

  /**
   * ดึงเฉพาะ officers ที่ is_active = true
   */
  async getAllActive(): Promise<Officer[]> {
    return db
      .select()
      .from(officers)
      .where(eq(officers.isActive, true))
      .orderBy(desc(officers.createdAt));
  },

  /**
   * ค้นหา officer จาก ID
   */
  async findById(id: string): Promise<Officer | null> {
    const results = await db
      .select()
      .from(officers)
      .where(eq(officers.id, id))
      .limit(1);

    return results[0] ?? null;
  },

  /**
   * ค้นหา officer จาก user_id
   */
  async findByUserId(userId: string): Promise<Officer | null> {
    const results = await db
      .select()
      .from(officers)
      .where(eq(officers.userId, userId))
      .limit(1);

    return results[0] ?? null;
  },

  /**
   * สร้าง officer ใหม่
   */
  async create(data: CreateOfficerData): Promise<Officer> {
    const [newOfficer] = await db
      .insert(officers)
      .values(data)
      .returning();

    return newOfficer;
  },

  /**
   * deactivate officer (soft delete)
   */
  async deactivate(id: string): Promise<Officer | null> {
    const [updated] = await db
      .update(officers)
      .set({ isActive: false })
      .where(eq(officers.id, id))
      .returning();

    return updated ?? null;
  },

  /**
   * อัปเดตข้อมูล officer
   */
  async update(id: string, data: UpdateOfficerData): Promise<Officer | null> {
    const [updated] = await db
      .update(officers)
      .set(data)
      .where(eq(officers.id, id))
      .returning();

    return updated ?? null;
  },

  /**
   * ดึง officers ที่ active พร้อมข้อมูล user
   */
  async getAllActiveWithUser() {
    return db
      .select({
        id: officers.id,
        userId: officers.userId,
        rank: officers.rank,
        department: officers.department,
        isActive: officers.isActive,
        createdAt: officers.createdAt,
        userName: users.name,
        userPhone: users.phone,
        userEmail: users.email,
      })
      .from(officers)
      .leftJoin(users, eq(officers.userId, users.id))
      .where(eq(officers.isActive, true))
      .orderBy(desc(officers.createdAt));
  },
};

export type OfficerRepo = typeof officerRepo;
