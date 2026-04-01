interface ThaibulkPayload {
  msisdn: string;
  message: string;
  sender: string;
  force: "standard" | "corporate";
}

export async function sendSms(msisdn: string, message: string): Promise<void> {
  const apiKey = process.env.THAIBULK_API_KEY;
  const apiSecret = process.env.THAIBULK_API_SECRET;
  const sender = process.env.THAIBULK_SENDER;

  if (!apiKey || !apiSecret || !sender) {
    throw new Error("Thaibulk SMS credentials not configured");
  }

  // สร้าง Basic Auth credentials จาก API key + secret (encode เป็น Base64)
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const payload: ThaibulkPayload = {
    msisdn, // เบอร์ปลายทาง
    message,
    sender,
    force: "corporate", // ใช้ sender name แบบ corporate (ไม่ใช่เบอร์สั้น)
  };

  const res = await fetch("https://api-v2.thaibulksms.com/sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Thaibulk SMS error (${res.status}): ${text}`);
  }
}
