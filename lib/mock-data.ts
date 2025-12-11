import { FraudAccount, Report, DashboardStats, Consultation } from "./types";

// Mock Fraud Accounts
export const mockFraudAccounts: FraudAccount[] = [
  {
    id: "1",
    accountNumber: "123-4-56789-0",
    bankName: "ธนาคารกสิกรไทย",
    accountName: "นายสมชาย รักเงิน",
    phoneNumber: "081-234-5678",
    reportCount: 15,
    totalDamage: 450000,
    lastReportedAt: "2024-12-10",
    status: "confirmed",
  },
  {
    id: "2",
    accountNumber: "987-6-54321-0",
    bankName: "ธนาคารไทยพาณิชย์",
    accountName: "นางสาวมิจฉา ชีพ",
    phoneNumber: "089-876-5432",
    reportCount: 8,
    totalDamage: 280000,
    lastReportedAt: "2024-12-09",
    status: "confirmed",
  },
  {
    id: "3",
    accountNumber: "456-7-89012-3",
    bankName: "ธนาคารกรุงเทพ",
    accountName: "นายหลอก ลวง",
    phoneNumber: "062-345-6789",
    reportCount: 5,
    totalDamage: 150000,
    lastReportedAt: "2024-12-08",
    status: "investigating",
  },
  {
    id: "4",
    accountNumber: "111-2-33333-4",
    bankName: "ธนาคารกรุงไทย",
    phoneNumber: "091-111-2222",
    reportCount: 3,
    totalDamage: 85000,
    lastReportedAt: "2024-12-07",
    status: "pending",
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: "1",
    caseNumber: "RPT-2024-0001",
    reporterName: "นายสมหมาย ดีใจ",
    reporterPhone: "081-111-1111",
    reporterEmail: "sommai@email.com",
    incidentDate: "2024-12-05",
    incidentDetails: "ถูกหลอกให้โอนเงินซื้อสินค้าออนไลน์ทางเพจ Facebook แต่ไม่ได้รับสินค้า",
    damageAmount: 15000,
    suspectAccount: "123-4-56789-0",
    suspectPhone: "081-234-5678",
    suspectSocialMedia: "facebook.com/fake.shop",
    evidenceImages: [],
    status: "pending",
    createdAt: "2024-12-10T10:30:00Z",
    updatedAt: "2024-12-10T10:30:00Z",
  },
  {
    id: "2",
    caseNumber: "RPT-2024-0002",
    reporterName: "นางสาวสมศรี มีสุข",
    reporterPhone: "082-222-2222",
    incidentDate: "2024-12-04",
    incidentDetails: "ได้รับ SMS แจ้งว่าได้รางวัล กดลิงก์แล้วถูกหักเงินจากบัญชี",
    damageAmount: 50000,
    suspectPhone: "02-xxx-xxxx",
    evidenceImages: [],
    status: "in_progress",
    createdAt: "2024-12-09T14:20:00Z",
    updatedAt: "2024-12-10T09:00:00Z",
    assignedOfficer: "พ.ต.ท. สมชาย รักษาความ",
  },
  {
    id: "3",
    caseNumber: "RPT-2024-0003",
    reporterName: "นายมานะ พยายาม",
    reporterPhone: "083-333-3333",
    incidentDate: "2024-12-01",
    incidentDetails: "ถูกหลอกลงทุนในแอปพลิเคชัน cryptocurrency ปลอม",
    damageAmount: 200000,
    suspectSocialMedia: "line: @crypto_invest",
    evidenceImages: [],
    status: "completed",
    createdAt: "2024-12-05T08:15:00Z",
    updatedAt: "2024-12-10T16:00:00Z",
    assignedOfficer: "พ.ต.ท. สมชาย รักษาความ",
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalReports: 156,
  pendingReports: 23,
  inProgressReports: 45,
  completedReports: 88,
  totalFraudAccounts: 234,
  totalDamageAmount: 15680000,
  todayReports: 5,
  weeklyReports: 28,
};

// Mock Consultations
export const mockConsultations: Consultation[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "คุณสมใจ ใจดี",
    subject: "สอบถามขั้นตอนการแจ้งความ",
    message: "สวัสดีครับ อยากทราบว่าขั้นตอนการแจ้งความออนไลน์ต้องเตรียมเอกสารอะไรบ้าง",
    status: "answered",
    createdAt: "2024-12-10T09:00:00Z",
    responses: [
      {
        id: "r1",
        responderId: "officer-1",
        responderName: "เจ้าหน้าที่ สมศักดิ์",
        message: "สวัสดีครับ สำหรับการแจ้งความออนไลน์ต้องเตรียม: 1. บัตรประชาชน 2. หลักฐานการโอนเงิน 3. ภาพหน้าจอการสนทนา 4. ข้อมูลบัญชีผู้ต้องสงสัย",
        createdAt: "2024-12-10T10:30:00Z",
      },
    ],
  },
  {
    id: "2",
    userId: "user-2",
    userName: "คุณรักดี มีศรี",
    subject: "ติดตามสถานะคดี",
    message: "หมายเลขคดี RPT-2024-0001 ดำเนินการถึงไหนแล้วครับ",
    status: "open",
    createdAt: "2024-12-10T11:00:00Z",
    responses: [],
  },
];

// Utility function to search fraud accounts
export function searchFraudAccount(query: string): FraudAccount | null {
  const normalizedQuery = query.replace(/-/g, "").toLowerCase();
  
  return mockFraudAccounts.find((account) => {
    const normalizedAccountNumber = account.accountNumber.replace(/-/g, "").toLowerCase();
    const normalizedPhone = account.phoneNumber?.replace(/-/g, "").toLowerCase() || "";
    
    return (
      normalizedAccountNumber.includes(normalizedQuery) ||
      normalizedPhone.includes(normalizedQuery)
    );
  }) || null;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}
