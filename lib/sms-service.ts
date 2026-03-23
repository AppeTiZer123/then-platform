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

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const payload: ThaibulkPayload = {
    msisdn,
    message,
    sender,
    force: "corporate",
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
