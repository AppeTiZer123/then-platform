import {
  pgSchema,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// สร้าง schema 'then_app'
export const thenApp = pgSchema("then_app");

// =============================================
// Users Table
// =============================================
export const users = thenApp.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  idCardEncrypted: text("id_card_encrypted"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  role: varchar("role", { length: 20 }).default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// OTP Verifications Table
// =============================================
export const otpVerifications = thenApp.table("otp_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).notNull(),
  otpCodeHash: varchar("otp_code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Fraud Accounts Table
// =============================================
export const fraudAccounts = thenApp.table("fraud_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountName: varchar("account_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  reportCount: integer("report_count").default(0),
  totalDamage: decimal("total_damage", { precision: 15, scale: 2 }).default(
    "0",
  ),
  status: varchar("status", { length: 20 }).default("pending"),
  idCardNumber: varchar("id_card_number", { length: 50 }),
  lastReportedAt: timestamp("last_reported_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Officers Table
// =============================================
export const officers = thenApp.table("officers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  rank: varchar("rank", { length: 100 }),
  department: varchar("department", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Reports Table
// =============================================
export const reports = thenApp.table("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseNumber: varchar("case_number", { length: 50 }).unique().notNull(),
  reporterId: uuid("reporter_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reporterName: varchar("reporter_name", { length: 255 }).notNull(),
  reporterPhone: varchar("reporter_phone", { length: 20 }).notNull(),
  reporterEmail: varchar("reporter_email", { length: 255 }),
  incidentDate: date("incident_date").notNull(),
  incidentDetails: text("incident_details").notNull(),
  damageAmount: decimal("damage_amount", { precision: 15, scale: 2 }).default(
    "0",
  ),
  suspectFraudAccountId: uuid("suspect_fraud_account_id").references(
    () => fraudAccounts.id,
    { onDelete: "set null" },
  ),
  suspectPhone: varchar("suspect_phone", { length: 20 }),
  suspectSocialMedia: text("suspect_social_media"),
  status: varchar("status", { length: 20 }).default("pending"),
  assignedOfficerId: uuid("assigned_officer_id").references(
    () => officers.id,
    { onDelete: "set null" },
  ),
  aiGeneratedDocument: jsonb("ai_generated_document"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Report Evidence Table
// =============================================
export const reportEvidence = thenApp.table("report_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id, {
    onDelete: "cascade",
  }),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }),
  originalName: varchar("original_name", { length: 255 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Consultations Table
// =============================================
export const consultations = thenApp.table("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Consultation Responses Table
// =============================================
export const consultationResponses = thenApp.table("consultation_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  consultationId: uuid("consultation_id").references(() => consultations.id, {
    onDelete: "cascade",
  }),
  responderId: uuid("responder_id").references(() => users.id, {
    onDelete: "set null",
  }),
  responderName: varchar("responder_name", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// Relations — กำหนดความสัมพันธ์ระหว่างตาราง (ใช้กับ Drizzle query API เช่น .findMany({ with: ... }))
// =============================================
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  consultations: many(consultations),
  officerProfile: many(officers),
}));

export const officersRelations = relations(officers, ({ one, many }) => ({
  user: one(users, {
    fields: [officers.userId],
    references: [users.id],
  }),
  assignedReports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  suspectAccount: one(fraudAccounts, {
    fields: [reports.suspectFraudAccountId],
    references: [fraudAccounts.id],
  }),
  assignedOfficer: one(officers, {
    fields: [reports.assignedOfficerId],
    references: [officers.id],
  }),
  evidence: many(reportEvidence),
}));

export const reportEvidenceRelations = relations(reportEvidence, ({ one }) => ({
  report: one(reports, {
    fields: [reportEvidence.reportId],
    references: [reports.id],
  }),
}));

export const consultationsRelations = relations(
  consultations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [consultations.userId],
      references: [users.id],
    }),
    responses: many(consultationResponses),
  }),
);

export const consultationResponsesRelations = relations(
  consultationResponses,
  ({ one }) => ({
    consultation: one(consultations, {
      fields: [consultationResponses.consultationId],
      references: [consultations.id],
    }),
    responder: one(users, {
      fields: [consultationResponses.responderId],
      references: [users.id],
    }),
  }),
);

// =============================================
// Type exports
// =============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FraudAccount = typeof fraudAccounts.$inferSelect;
export type Officer = typeof officers.$inferSelect;
export type NewOfficer = typeof officers.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type Consultation = typeof consultations.$inferSelect;
