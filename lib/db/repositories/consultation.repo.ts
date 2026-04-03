import { db } from "@/lib/db";
import { consultations, consultationResponses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type Consultation = typeof consultations.$inferSelect;
export type ConsultationResponse = typeof consultationResponses.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
export type NewConsultationResponse = typeof consultationResponses.$inferInsert;

export const consultationRepo = {
  /**
   * สร้างคำถามใหม่ (User)
   */
  async create(data: NewConsultation) {
    const [result] = await db.insert(consultations).values(data).returning();
    return result;
  },

  /**
   * ดึงรายการคำถามทั้งหมดของ 1 User (แสดงหน้า User)
   */
  async getByUserId(userId: string) {
    return db.query.consultations.findMany({
      where: eq(consultations.userId, userId),
      orderBy: [desc(consultations.createdAt)],
      with: {
        responses: {
          orderBy: [desc(consultationResponses.createdAt)],
          with: {
            responder: {
              columns: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * ดึงรายการคำถามทั้งหมด (แสดงหน้า Admin)
   */
  async getAll() {
    return db.query.consultations.findMany({
      orderBy: [desc(consultations.createdAt)],
      with: {
        user: {
          columns: {
            phone: true,
            email: true,
          },
        },
        responses: {
          orderBy: [desc(consultationResponses.createdAt)],
          columns: {
            id: true,
            message: true,
            createdAt: true,
            responderId: true,
            responderName: true,
          },
          with: {
            responder: {
              columns: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * ดึงรายละเอียดคำถามเดียว พร้อมคำตอบ
   */
  async getById(id: string) {
    return db.query.consultations.findFirst({
      where: eq(consultations.id, id),
      with: {
        user: {
          columns: {
            phone: true,
            email: true,
          },
        },
        responses: {
          orderBy: [desc(consultationResponses.createdAt)],
          with: {
            responder: {
              columns: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * เพิ่มคำตอบจาก Admin
   * ใช้ Transaction รับประกันว่า insert response + เปลี่ยน status เป็น "answered" จะสำเร็จหรือล้มเหลวพร้อมกัน
   */
  async addResponse(consultationId: string, data: Omit<NewConsultationResponse, "consultationId">) {
    return db.transaction(async (tx) => {
      const [response] = await tx
        .insert(consultationResponses)
        .values({
          ...data,
          consultationId,
        })
        .returning();

      await tx
        .update(consultations)
        .set({ status: "answered", updatedAt: new Date() })
        .where(eq(consultations.id, consultationId));

      return response;
    });
  },
};
