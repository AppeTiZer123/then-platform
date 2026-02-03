// Types for the THEN application

export interface FraudAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName?: string;
  phoneNumber?: string;
  reportCount: number;
  totalDamage: number;
  lastReportedAt: string;
  status: "confirmed" | "pending" | "investigating"; // pending = รอตรวจสอบ, investigating = กำลังตรวจสอบ, confirmed = ยืนยันแล้ว
}

export interface Report {
  id: string;
  caseNumber: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  incidentDate: string;
  incidentDetails: string;
  damageAmount: number;
  suspectAccount?: string;
  suspectPhone?: string;
  suspectSocialMedia?: string;
  evidenceImages: string[];
  status: "tip" | "pending" | "in_progress" | "completed"; // tip = แจ้งเบาะแส, pending = รอดำเนินการ, in_progress = กำลังดำเนินการ, completed = ออกเอกสารแล้ว
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  completedReports: number;
  totalFraudAccounts: number;
  totalDamageAmount: number;
  todayReports: number;
  weeklyReports: number;
}

export interface Consultation {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  responses: ConsultationResponse[];
}

export interface ConsultationResponse {
  id: string;
  responderId: string;
  responderName: string;
  message: string;
  createdAt: string;
}

export interface ReportFormData {
  // Step 1: Personal Info
  fullName: string;
  idCard: string;
  phone: string;
  email?: string;
  address: string;

  // Step 2: Case Details
  incidentDate: string;
  incidentTime?: string;
  damageAmount: number;
  incidentDetails: string;
  suspectAccount?: string;
  suspectBank?: string;
  suspectPhone?: string;
  suspectSocialMedia?: string;

  // Step 3: Evidence
  evidenceImages: File[];
  additionalInfo?: string;
}
