import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { searchAllFraudAccountsFromDB } from "@/lib/actions/fraud";

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
6. แนะนำให้ใช้ฟีเจอร์ "แจ้งเบาะแส" ของระบบ หากผู้ใช้ต้องการรายงานมิจฉาชีพ
7. **สำคัญมาก:** หากผู้ใช้ถูกหลอกลวง โดนโกง หรือต้องการแจ้งความ ให้แนะนำให้ใช้ฟีเจอร์ "สร้างเอกสารแจ้งความ" ของเว็บไซต์ THEN โดยไปที่หน้า /report ซึ่งระบบจะช่วยสร้างเอกสารแจ้งความอัตโนมัติ ใช้เวลาไม่นาน และสามารถนำไปยื่นที่สถานีตำรวจได้ทันที`;

// Regex patterns สำหรับตรวจจับข้อมูลที่ต้องค้นหา
// ไม่ใช้ global flag เพื่อหลีกเลี่ยง lastIndex state bug
const ACCOUNT_NUMBER_PATTERN = /\d{3}-?\d-?\d{5}-?\d|\d{10,}/;
const PHONE_PATTERN = /0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}|0\d{8,9}/;
const NAME_PATTERNS = [
  // "ตรวจสอบ X", "ค้นหา X", "เช็ค X", "หา X"
  /(?:ตรวจสอบ|ค้นหา|เช็ค|เช็ก|หา)(?:ชื่อ|บัญชี|คน|มิจ)?[\s:]+(.+)/i,
  // "ชื่อ X"
  /ชื่อ\s+([ก-๙a-z].+)/i,
  // "X มีมั้ย", "X มีไหม", "X อยู่ในระบบ", "X เป็นมิจ", "X มีคนชื่อนี้"
  /^([ก-๙a-zA-Z\s]+?)\s+(?:มีมั้ย|มีไหม|มีคน|อยู่ในระบบ|เป็นมิจ|น่าเชื่อถือ|โกง|หลอก)/i,
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

// จำกัด turn เก่าที่สุดที่ส่งไปให้ model เพื่อคุม token cost (1 turn = user + assistant)
const MAX_HISTORY_TURNS = 6;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // ตัด history เก่าทิ้ง เก็บแค่ข้อความล่าสุดตามขนาด window
    const windowedMessages = messages.slice(-(MAX_HISTORY_TURNS * 2));

    // ดึง message ล่าสุดของ user
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop();

    let contextMessage = "";

    // ถ้าเจอข้อมูลบัญชีมิจฉาชีพใน DB → แนบเป็น context เพิ่มเติมใน system prompt
    if (lastUserMessage) {
      const query = extractSearchQuery(lastUserMessage.content);
      if (query) {
        const fraudAccounts = await searchAllFraudAccountsFromDB(query);
        if (fraudAccounts.length > 0) {
          const accountList = fraudAccounts.map((account, idx) => {
            const name = account.accountName || "ไม่ระบุ";
            const count = account.reportCount || 0;
            const damage = account.totalDamage || 0;
            return (idx + 1) + ". ชื่อบัญชี: " + name + " | เลขบัญชี: " + account.accountNumber + " | ธนาคาร: " + account.bankName + " | ถูกรายงาน: " + count + " ครั้ง | ความเสียหาย: " + damage + " บาท | สถานะ: " + account.status;
          }).join("\n");
          contextMessage =
            "\n[ข้อมูลจากฐานข้อมูลมิจฉาชีพ]\n" +
            "ค้นหา \"" + query + "\" พบ " + fraudAccounts.length + " บัญชีที่มีการรายงาน:\n" +
            accountList +
            "\n\nกรุณาแจ้งเตือนผู้ใช้อย่างชัดเจน และแสดงบัญชีทั้งหมดที่พบ";
        }
      }
    }

    const result = streamText({
      model: google("gemini-3.1-flash-lite-preview"),
      system: SYSTEM_PROMPT + contextMessage,
      messages: windowedMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // ดัก quota exceeded (429) แสดงข้อความที่เข้าใจได้แทน error ดิบ
    const isQuotaError =
      error instanceof Error &&
      (error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED"));

    if (isQuotaError) {
      return new Response(
        "⚠️ ขณะนี้ระบบ AI มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองใหม่อีกครั้งครับ",
        { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
