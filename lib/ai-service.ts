// AI responses for consultation - uses Server Action for database queries
import { searchAllFraudAccountsFromDB } from "./actions/fraud";

type FraudAccount = Awaited<ReturnType<typeof searchAllFraudAccountsFromDB>>[number];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Regex patterns สำหรับตรวจจับข้อมูลที่ต้องค้นหา
// ไม่ใช้ global flag เพื่อหลีกเลี่ยง lastIndex state bug
const ACCOUNT_NUMBER_PATTERN = /\d{3}-?\d-?\d{5}-?\d|\d{10,}/;
const PHONE_PATTERN = /0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}|0\d{8,9}/;

// ดึง query จาก message สำหรับค้นหามิจฉาชีพ
function extractSearchQuery(message: string): string | null {
  // ลองหาเลขบัญชีก่อน
  const accountMatches = message.match(ACCOUNT_NUMBER_PATTERN);
  if (accountMatches && accountMatches.length > 0) {
    return accountMatches[0];
  }

  // ลองหาเบอร์โทร
  const phoneMatches = message.match(PHONE_PATTERN);
  if (phoneMatches && phoneMatches.length > 0) {
    return phoneMatches[0];
  }

  // ลองหาชื่อจาก pattern "ตรวจสอบชื่อ xxx" หรือ "ค้นหา xxx"
  const namePatterns = [
    /ตรวจสอบ(?:ชื่อ)?\s*[:\s]?\s*(.+)/i,
    /ค้นหา(?:ชื่อ)?\s*[:\s]?\s*(.+)/i,
    /เช็ค(?:ชื่อ)?\s*[:\s]?\s*(.+)/i,
    // "X มีมั้ย", "X มีคนชื่อนี้", "X อยู่ในระบบ" ฯลฯ
    /^([ก-๙a-zA-Z\s]+?)\s+(?:มีมั้ย|มีไหม|มีคน|อยู่ในระบบ|เป็นมิจ|น่าเชื่อถือ|โกง|หลอก)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      // ถ้าเจอแล้วเป็นตัวเลข ให้ข้ามไป (จะจับโดย pattern ด้านบนแทน)
      const extracted = match[1].trim();
      if (!/^\d+$/.test(extracted.replace(/-/g, ""))) {
        return extracted;
      }
    }
  }

  return null;
}

// สร้าง response สำหรับผลการค้นหามิจฉาชีพ (หลายผลลัพธ์)
function formatFraudResponse(accounts: FraudAccount[]): string {
  const statusMap: Record<string, string> = {
    confirmed: "🔴 ยืนยันแล้ว",
    investigating: "🟡 กำลังตรวจสอบ",
    pending: "⚪ รอตรวจสอบ",
  };

  if (accounts.length === 1) {
    const account = accounts[0];
    return `⚠️ พบรายงานมิจฉาชีพ!

📋 ข้อมูลบัญชี:
• ชื่อบัญชี: ${account.accountName || "ไม่ระบุ"}
• เลขบัญชี: ${account.accountNumber}
• ธนาคาร: ${account.bankName}
• เบอร์โทร: ${account.phoneNumber || "ไม่ระบุ"}

📊 สถิติ:
• ถูกรายงาน: ${account.reportCount || 0} ครั้ง
• ความเสียหายรวม: ${formatCurrency(account.totalDamage)}
• สถานะ: ${statusMap[account.status || "pending"] || account.status}

⚠️ คำเตือน: โปรดระวังการทำธุรกรรมกับบุคคลนี้!

📄 หากคุณถูกหลอกลวงโดยบุคคลนี้ แนะนำให้ไปที่หน้า **สร้างรายงาน** (/report) เพื่อให้ AI ช่วยสร้างเอกสารแจ้งความอัตโนมัติ พร้อมนำไปยื่นที่สถานีตำรวจได้ทันทีครับ`;
  }

  // หลายผลลัพธ์
  const accountLines = accounts.map((account, idx) => {
    return `🔶 **บัญชีที่ ${idx + 1}**
   • เลขบัญชี: ${account.accountNumber}
   • ธนาคาร: ${account.bankName}
   • ถูกรายงาน: ${account.reportCount || 0} ครั้ง | ความเสียหาย: ${formatCurrency(account.totalDamage)}
   • สถานะ: ${statusMap[account.status || "pending"] || account.status}`;
  }).join("\n\n");

  return `⚠️ พบบัญชีไปในฝูกมิจฉาชีพทั้งหมด ${accounts.length} บัญชี!

${accountLines}

⚠️ คำเตือน: โปรดระวังการทำธุรกรรมกับบุคคลนี้ทุกบัญชี!

📄 หากคุณถูกหลอกลวงโดยบุคคลนี้ แนะนำให้ไปที่หน้า **สร้างรายงาน** (/report) เพื่อให้ AI ช่วยสร้างเอกสารแจ้งความอัตโนมัติ พร้อมนำไปยื่นที่สถานีตำรวจได้ทันทีครับ`;
}

function formatNotFoundResponse(query: string): string {
  return `✅ ไม่พบในฐานข้อมูลมิจฉาชีพ

ไม่พบข้อมูล "${query}" ในระบบฐานข้อมูลมิจฉาชีพของเรา

⚠️ หมายเหตุ: 
• การไม่พบในฐานข้อมูลไม่ได้หมายความว่าปลอดภัย 100%
• ควรตรวจสอบข้อมูลจากหลายแหล่งก่อนทำธุรกรรม
• หากมีข้อสงสัย ควรใช้บริการเก็บเงินปลายทาง

ต้องการสอบถามเพิ่มเติมไหมครับ?`;
}

// ตรวจสอบว่าข้อความต้องการค้นหามิจฉาชีพหรือไม่
function shouldSearchFraud(message: string): boolean {
  const searchKeywords = [
    "ตรวจสอบ",
    "ค้นหา",
    "เช็ค",
    "เช็ก",
    "check",
    "มิจฉาชีพ",
    "บัญชี",
    "เลขบัญชี",
    "เบอร์",
    "หลอกลวง",
    "โกง",
    "น่าเชื่อถือ",
    "ปลอดภัย",
    "มีมั้ย",
    "มีไหม",
    "มีคน",
    "อยู่ในระบบ",
    "เป็นมิจ",
  ];

  const lowerMessage = message.toLowerCase();
  const hasKeyword = searchKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  const hasPattern =
    ACCOUNT_NUMBER_PATTERN.test(message) || PHONE_PATTERN.test(message);

  return hasKeyword || hasPattern;
}

// Predefined responses based on keywords
const responses: { keywords: string[]; response: string }[] = [
  {
    keywords: ["สวัสดี", "หวัดดี", "hello", "hi"],
    response:
      "สวัสดีครับ! ผมเป็น AI ผู้ช่วยของระบบ THEN พร้อมให้คำปรึกษาเรื่องการถูกหลอกลวงออนไลน์ครับ มีอะไรให้ช่วยไหมครับ?",
  },
  {
    keywords: ["โดนโกง", "ถูกหลอก", "โกง", "หลอก"],
    response:
      "เข้าใจครับ การถูกหลอกลวงเป็นเรื่องที่น่าเศร้ามาก ขอแนะนำให้คุณ:\n\n1. **เก็บหลักฐานทั้งหมด** - ภาพหน้าจอการสนทนา, หลักฐานการโอนเงิน\n2. **แจ้งธนาคาร** - โทรแจ้งธนาคารทันทีเพื่อระงับบัญชี\n3. **สร้างเอกสารแจ้งความ** - ใช้ระบบของ THEN ที่หน้า /report เพื่อให้ AI ช่วยสร้างเอกสารแจ้งความอัตโนมัติ พร้อมนำไปยื่นที่สถานีตำรวจได้ทันที\n\n📄 **แนะนำ:** ไปที่หน้า **สร้างรายงาน** บนเว็บไซต์นี้ ระบบจะช่วยสร้างเอกสารแจ้งความให้โดยอัตโนมัติครับ\n\nต้องการให้ช่วยอะไรเพิ่มเติมไหมครับ?",
  },
  {
    keywords: ["แจ้งความ", "แจ้ง", "ร้องเรียน", "เอกสาร"],
    response:
      "ระบบ THEN ช่วยให้คุณ **สร้างเอกสารแจ้งความ** ได้ง่ายๆ ครับ:\n\n📄 **วิธีใช้งาน:**\n1. ไปที่หน้า **สร้างรายงาน** (/report) บนเว็บไซต์นี้\n2. เล่าเหตุการณ์ที่เกิดขึ้น\n3. AI จะวิเคราะห์และสร้างเอกสารแจ้งความให้อัตโนมัติ\n4. ดาวน์โหลด PDF แล้วนำไปยื่นที่สถานีตำรวจได้เลย\n\n**หมายเหตุ:** ต้องเข้าสู่ระบบก่อนจึงจะใช้งานได้ครับ",
  },
  {
    keywords: ["เงิน", "โอน", "คืน", "ได้เงินคืน"],
    response:
      "การติดตามเงินคืนขึ้นอยู่กับหลายปัจจัยครับ:\n\n1. **ความเร็วในการแจ้ง** - ยิ่งแจ้งเร็ว โอกาสได้เงินคืนยิ่งมาก\n2. **หลักฐาน** - มีหลักฐานครบถ้วนจะช่วยให้ดำเนินการได้เร็วขึ้น\n3. **ประสานงาน** - ต้องประสานงานกับธนาคารและตำรวจ\n\nแนะนำให้แจ้งความและแจ้งธนาคารโดยเร็วที่สุดครับ",
  },
  {
    keywords: ["facebook", "เฟสบุ๊ค", "เพจ"],
    response:
      "การหลอกลวงผ่าน Facebook มีหลายรูปแบบครับ:\n\n• **เพจปลอม** - แอบอ้างเป็นร้านค้าหรือแบรนด์\n• **โฆษณาลวง** - ขายของราคาถูกแต่ไม่ส่งของ\n• **แชทส่วนตัว** - หลอกให้โอนเงิน\n\n**วิธีป้องกัน:**\n1. ตรวจสอบประวัติเพจก่อนซื้อ\n2. ใช้บริการเก็บเงินปลายทาง\n3. ไม่โอนเงินก่อนได้รับสินค้า",
  },
  {
    keywords: ["line", "ไลน์"],
    response:
      "การหลอกลวงผ่าน LINE ที่พบบ่อย:\n\n• **ปลอมเป็นคนรู้จัก** - ขอยืมเงิน\n• **แอบอ้างเป็นธนาคาร** - ขอข้อมูลส่วนตัว\n• **ลิงก์ปลอม** - หลอกให้กรอกข้อมูล\n\n**คำเตือน:** ธนาคารไม่เคยส่งลิงก์ทาง LINE ให้ยืนยันข้อมูลครับ",
  },
];

const defaultResponse =
  "ขอบคุณสำหรับคำถามครับ ผมจะพยายามช่วยเหลือให้ดีที่สุด\n\n💡 ระบบ THEN มีบริการดังนี้:\n• **ตรวจสอบมิจฉาชีพ** - พิมพ์เลขบัญชีหรือเบอร์โทรมาได้เลย\n• **สร้างเอกสารแจ้งความ** - ไปที่หน้า /report เพื่อให้ AI ช่วยสร้าง PDF แจ้งความ พร้อมยื่นตำรวจ\n• **แจ้งเบาะแส** - กดปุ่ม 'แจ้งเบาะแส' ด้านล่างเพื่อรายงานมิจฉาชีพ\n\nมีอะไรอื่นให้ช่วยไหมครับ?";

// Format currency
function formatCurrency(amount: number | string | null): string {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : amount || 0;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(numAmount);
}

// ลำดับการตอบกลับ: ค้น DB ด้วย regex → ค้น DB ด้วยข้อความตรง → จับคู่ keyword → default
export async function getAIResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  const trimmedMessage = message.trim();

  // ขั้น 1: ดึงเลขบัญชี/เบอร์โทร/ชื่อ จาก regex แล้วค้นใน DB (คืนทุกผลลัพธ์)
  const extractedQuery = extractSearchQuery(message);
  if (extractedQuery) {
    const results = await searchAllFraudAccountsFromDB(extractedQuery);
    if (results.length > 0) {
      return formatFraudResponse(results);
    }
    // extract ได้แต่ไม่เจอ + มี keyword ค้นหา → แจ้งว่าไม่พบ
    if (shouldSearchFraud(message)) {
      return formatNotFoundResponse(extractedQuery);
    }
  }

  // ขั้น 2: fallback — ค้นด้วยข้อความทั้งหมด (กรณีพิมพ์ชื่อเฉยๆ เช่น "นายสมชาย รักเงิน")
  const directResults = await searchAllFraudAccountsFromDB(trimmedMessage);
  if (directResults.length > 0) {
    return formatFraudResponse(directResults);
  }

  // ขั้น 3: จับคู่ keyword สำเร็จรูป (สวัสดี, โดนโกง, แจ้งความ ฯลฯ)
  for (const item of responses) {
    if (item.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }

  return defaultResponse;
}

export function createMessage(
  role: "user" | "assistant",
  content: string,
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
  };
}
