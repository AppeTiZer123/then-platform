import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

// Server-side client ใช้ service_role — bypass RLS ทั้งหมด
// ใช้ได้เฉพาะใน API routes / server actions เท่านั้น ห้าม expose ฝั่ง client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false, // server-side ไม่ต้อง refresh token อัตโนมัติ
    persistSession: false,   // ไม่เก็บ session (stateless)
  },
});

export const EVIDENCE_BUCKET = "report-evidence";
