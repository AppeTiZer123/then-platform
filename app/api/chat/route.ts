import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { searchFraudAccountFromDB } from "@/lib/actions/fraud";

// System prompt สำหรับ AI ผู้ช่วยของ THEN
const SYSTEM_PROMPT = `คุณเป็น AI ผู้ช่วยของระบบ THEN (Thailand Honest Exchange Network) ที่ช่วยเหลือผู้ใช้เกี่ยวกับ:
- การถูกหลอกลวงออนไลน์
- การตรวจสอบบัญชีมิจฉาชีพ
- ขั้นตอนการแจ้งความ
- วิธีป้องกันตัวจากมิจฉาชีพ

กฎการตอบ:
1. ตอบเป็นภาษาไทยเท่านั้น
2. ตอบสั้นๆ กระชับ ได้ใจความ
3. ใช้ emoji เหมาะสม เช่น ⚠️ สำหรับคำเตือน ✅ สำหรับข้อมูลที่ดี
4. หากผู้ใช้ถูกหลอก ให้แนะนำขั้นตอนอย่างชัดเจน
5. หากมีข้อมูลบัญชีมิจฉาชีพจากระบบ ให้แสดงข้อมูลนั้นด้วย
6. แนะนำให้ใช้ฟีเจอร์ "แจ้งเบาะแส" ของระบบ หากผู้ใช้ต้องการรายงานมิจฉาชีพ`;

// Regex patterns สำหรับตรวจจับข้อมูลที่ต้องค้นหา
// ไม่ใช้ global flag เพื่อหลีกเลี่ยง lastIndex state bug
const ACCOUNT_NUMBER_PATTERN = /\d{3}-?\d-?\d{5}-?\d|\d{10,}/;
const PHONE_PATTERN = /0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}|0\d{8,9}/;
const NAME_PATTERNS = [
  /(?:ตรวจสอบ|ค้นหา|เช็ค|เช็ก|หา)(?:ชื่อ|บัญชี|คน|มิจ)?[\s:]+(.+)/i,
  /ชื่อ\s+([ก-๙a-z].+)/i,
];

// Extract search query จาก message (เลขบัญชี → เบอร์ → ชื่อ)
function extractSearchQuery(message: string): string | null {
  const accountMatch = message.match(ACCOUNT_NUMBER_PATTERN);
  if (accountMatch) return accountMatch[0];

  const phoneMatch = message.match(PHONE_PATTERN);
  if (phoneMatch) return phoneMatch[0];

  for (const pattern of NAME_PATTERNS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const extracted = match[1].trim();
      // กรองออกถ้าผลที่ได้เป็นแค่ตัวเลข
      if (!/^\d+$/.test(extracted.replace(/-/g, ""))) {
        return extracted;
      }
    }
  }

  return null;
}

// จำนวน turn สูงสุดที่ส่งไปให้ model (1 turn = 1 user + 1 assistant)
// เกินนี้จะตัด history เก่าออกเพื่อประหยัด token
const MAX_HISTORY_TURNS = 6;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // ตัด history เก่าออก — เก็บแค่ MAX_HISTORY_TURNS * 2 messages ล่าสุด
    const windowedMessages = messages.slice(-(MAX_HISTORY_TURNS * 2));

    // ดึง message ล่าสุดของ user
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop();

    let contextMessage = "";

    // ถ้ามีเลขบัญชีหรือเบอร์โทร ลองค้นหาจาก database
    if (lastUserMessage) {
      const query = extractSearchQuery(lastUserMessage.content);
      if (query) {
        const fraudAccount = await searchFraudAccountFromDB(query);
        if (fraudAccount) {
          contextMessage = `
[ข้อมูลจากฐานข้อมูลมิจฉาชีพ]
พบบัญชีที่มีการรายงาน:
- ชื่อบัญชี: ${fraudAccount.accountName || "ไม่ระบุ"}
- เลขบัญชี: ${fraudAccount.accountNumber}
- ธนาคาร: ${fraudAccount.bankName}
- ถูกรายงาน: ${fraudAccount.reportCount || 0} ครั้ง
- ความเสียหายรวม: ${fraudAccount.totalDamage || 0} บาท
- สถานะ: ${fraudAccount.status}

กรุณาแจ้งเตือนผู้ใช้เกี่ยวกับบัญชีนี้อย่างชัดเจน`;
        }
      }
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT + contextMessage,
      messages: windowedMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
