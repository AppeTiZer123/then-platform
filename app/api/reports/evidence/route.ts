import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin, EVIDENCE_BUCKET } from "@/lib/supabase";
import { evidenceRepo, reportRepo } from "@/lib/db/repositories";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const reportId = formData.get("reportId") as string;
    const files = formData.getAll("files") as File[];

    if (!reportId || files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "reportId and files are required" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า report นี้เป็นของ user คนนี้
    const report = await reportRepo.findById(reportId);
    if (!report) {
      return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });
    }
    if (report.reporterId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const results = [];

    for (const file of files) {
      // Validate
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { ok: false, error: `ไฟล์ ${file.name} ใหญ่เกิน 10MB` },
          { status: 400 },
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { ok: false, error: `ประเภทไฟล์ ${file.type} ไม่รองรับ` },
          { status: 400 },
        );
      }

      // Upload ไปยัง Supabase Storage
      const ext = file.name.split(".").pop();
      const storagePath = `${reportId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(EVIDENCE_BUCKET)
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { ok: false, error: `อัปโหลดไฟล์ ${file.name} ไม่สำเร็จ: ${uploadError.message}` },
          { status: 500 },
        );
      }

      // บันทึกลง DB — เก็บ storagePath ไว้ แล้ว generate signed URL ใหม่ตอน re-download
      const evidence = await evidenceRepo.create({
        reportId,
        fileUrl: storagePath, // เก็บ path ไม่ใช่ signed URL เพราะ signed URL หมดอายุ
        fileType: file.type,
        originalName: file.name,
        fileSize: file.size,
      });

      results.push(evidence);
    }

    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    console.error("Evidence upload error:", error);
    return NextResponse.json(
      { ok: false, error: "เกิดข้อผิดพลาดในการอัปโหลด" },
      { status: 500 },
    );
  }
}
