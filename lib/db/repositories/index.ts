/**
 * Repositories - Entry point สำหรับ database access layer
 */

export { userRepo } from "./user.repo";
export { fraudRepo } from "./fraud.repo";
export { reportRepo } from "./report.repo";
export { consultationRepo } from "./consultation.repo";

export type { UserRepo } from "./user.repo";
export type { FraudRepo } from "./fraud.repo";
export type { ReportRepo } from "./report.repo";
