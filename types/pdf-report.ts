// Types สำหรับ PDF เอกสารรับแจ้งเหตุการกระทำผิดทางเทคโนโลยี
// อิงจาก n8n HTML template fields

export interface IncidentReportData {
  // ข้อมูลผู้เสียหาย (Section 1)
  fullname: string;
  age: string;
  id_card: string;
  gender: string;
  birth_date: string;
  phone: string;
  carrier: string;
  email?: string;

  // ที่อยู่ (Section 2)
  address: string;
  current_address: string;

  // ข้อมูลสถานีตำรวจ (Section 3)
  met_investigator?: boolean; // true = เคยพบแล้ว, false = ยังไม่เคยพบ
  police_province?: string;
  station_name?: string;
  tech_crime_province?: string;

  // รายละเอียดเหตุการณ์ (Section 4)
  case_type?: string; // ประเภทคดีที่ตรงกับ caseTypes array ใน PDF template
  incident_details: string;

  // ทรัพย์สินที่เสียหาย (Section 5)
  asset_type: string;
  asset_details: string;
  asset_value: string;
  asset_date: string;
  asset_time: string;

  // หลักฐานแนบ
  evidence_images?: string[]; // base64 encoded images

  // ช่องทางติดต่อคนร้าย (Section 6)
  // --- โทรศัพท์ ---
  received_phone?: string;
  victim_carrier?: string;
  perpetrator_phone?: string;
  contact_datetime?: string;

  // --- SMS ---
  sms_received_phone?: string;
  sms_victim_carrier?: string;
  sms_sender_type?: string;
  sms_sender_info?: string;
  sms_received_time?: string;
  sms_message?: string;

  // --- Social Media ---
  social_media_type?: string;
  social_media_url?: string;

  // ลายเซ็น / วันที่ (Section 7)
  victim_signature?: string;
  recipient_signature?: string;
  report_date: string;
}

// Empty template สำหรับ form
export const emptyIncidentReportData: IncidentReportData = {
  fullname: "",
  age: "",
  id_card: "",
  gender: "",
  birth_date: "",
  phone: "",
  carrier: "",
  email: "",
  address: "",
  current_address: "",
  met_investigator: undefined,
  police_province: "",
  station_name: "",
  tech_crime_province: "",
  case_type: "",
  incident_details: "",
  asset_type: "",
  asset_details: "",
  asset_value: "",
  asset_date: "",
  asset_time: "",
  evidence_images: [],
  received_phone: "",
  victim_carrier: "",
  perpetrator_phone: "",
  contact_datetime: "",
  sms_received_phone: "",
  sms_victim_carrier: "",
  sms_sender_type: "",
  sms_sender_info: "",
  sms_received_time: "",
  sms_message: "",
  social_media_type: "",
  social_media_url: "",
  victim_signature: "",
  recipient_signature: "",
  report_date: "",
};

// Sample data สำหรับ testing
export const sampleIncidentReportData: IncidentReportData = {
  fullname: "นายทดสอบ ระบบ",
  age: "35",
  id_card: "1234567890123",
  gender: "ชาย",
  birth_date: "1 มกราคม 2533",
  phone: "0891234567",
  carrier: "TRUE",
  email: "test@example.com",
  address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110",
  current_address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110",
  police_province: "กรุงเทพมหานคร",
  station_name: "คลองเตย",
  tech_crime_province: "กรุงเทพมหานคร",
  incident_details:
    "เมื่อวันที่ 1 กุมภาพันธ์ 2569 ผู้เสียหายได้พบโฆษณาขายสินค้าราคาถูกทาง Facebook จึงได้ติดต่อผู้ขายทาง Line และโอนเงินไปยังบัญชีธนาคาร หลังโอนเงินแล้ว ผู้ขายได้บล็อคและหายไป",
  asset_type: "เงินสด",
  asset_details: "โอนเงินผ่านบัญชีธนาคาร",
  asset_value: "5000",
  asset_date: "1 กุมภาพันธ์ 2569",
  asset_time: "14:30",
  evidence_images: [],
  received_phone: "0891234567",
  victim_carrier: "TRUE",
  perpetrator_phone: "0899876543",
  contact_datetime: "1 กุมภาพันธ์ 2569 14:00",
  social_media_type: "Facebook, Line",
  social_media_url: "https://facebook.com/scammer",
  victim_signature: "นายทดสอบ ระบบ",
  recipient_signature: "",
  report_date: "2 กุมภาพันธ์ 2569",
};
