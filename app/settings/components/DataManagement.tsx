"use client";

import React, { useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = "backup" | "import" | null;
type ImportStep = "idle" | "uploading" | "preview" | "confirming" | "done";

interface PreviewRow {
  accountNumber: string;
  bankName: string;
  accountName?: string;
  phoneNumber?: string;
  status?: string;
}

interface ImportResult {
  inserted: number;
  updated: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadCSV(type: "reports" | "fraud-accounts") {
  const res = await fetch(`/api/admin/backup?type=${type}`);
  if (!res.ok) throw new Error("ดาวน์โหลดล้มเหลว");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    type === "reports"
      ? `reports-${new Date().toISOString().split("T")[0]}.csv`
      : `fraud-accounts-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadTemplate() {
  const res = await fetch("/api/admin/import?template=1");
  if (!res.ok) throw new Error("ดาวน์โหลด template ล้มเหลว");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fraud-accounts-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DataManagement() {
  const [action, setAction] = useState<ActionType>(null);

  // Backup state
  const [downloadingReports, setDownloadingReports] = useState(false);
  const [downloadingFraud, setDownloadingFraud] = useState(false);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Backup handlers ──────────────────────────────────────────────────────────

  const handleDownload = async (type: "reports" | "fraud-accounts") => {
    if (type === "reports") setDownloadingReports(true);
    else setDownloadingFraud(true);
    try {
      await downloadCSV(type);
    } catch {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่");
    } finally {
      if (type === "reports") setDownloadingReports(false);
      else setDownloadingFraud(false);
    }
  };

  // ── Import handlers ──────────────────────────────────────────────────────────

  const resetImport = () => {
    setImportStep("idle");
    setSelectedFile(null);
    setPreview([]);
    setPreviewTotal(0);
    setImportResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMsg("รองรับเฉพาะไฟล์ .csv เท่านั้น");
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setImportStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorMsg(json.error ?? "เกิดข้อผิดพลาด");
        if (json.details?.length) {
          setErrorMsg(`${json.error}\n${json.details.join("\n")}`);
        }
        setImportStep("idle");
        return;
      }

      setPreview(json.preview);
      setPreviewTotal(json.total);
      setImportStep("preview");
    } catch {
      setErrorMsg("อัพโหลดไฟล์ล้มเหลว");
      setImportStep("idle");
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setImportStep("confirming");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/import?confirm=1", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorMsg(json.error ?? "นำเข้าล้มเหลว");
        setImportStep("preview");
        return;
      }

      setImportResult({ inserted: json.inserted, updated: json.updated, total: json.total });
      setImportStep("done");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดระหว่างนำเข้า");
      setImportStep("preview");
    }
  };

  const handleCloseDialog = () => {
    setAction(null);
    resetImport();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>การจัดการข้อมูล</CardTitle>
          <CardDescription>
            สำรองข้อมูล และนำเข้าข้อมูลบัญชีมิจฉาชีพจากไฟล์ CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {/* Backup */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">สำรองข้อมูล (Backup)</div>
                <div className="text-xs text-muted-foreground">
                  ดาวน์โหลด reports หรือบัญชีมิจฉาชีพเป็น CSV
                </div>
              </div>
              <Button size="sm" onClick={() => setAction("backup")}>
                ดาวน์โหลด
              </Button>
            </div>

            <div className="border-t" />

            {/* Import */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">นำเข้าข้อมูล (Import)</div>
                <div className="text-xs text-muted-foreground">
                  อัพโหลดไฟล์ CSV บัญชีมิจฉาชีพจาก Excel
                </div>
              </div>
              <Button size="sm" onClick={() => setAction("import")}>
                นำเข้า
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Backup Dialog ── */}
      <Dialog open={action === "backup"} onOpenChange={(o) => !o && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>ดาวน์โหลด CSV Backup</DialogTitle>
          <DialogDescription>
            เลือกประเภทข้อมูลที่ต้องการสำรอง
          </DialogDescription>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">รายการแจ้งความ (Reports)</div>
                <div className="text-xs text-muted-foreground">
                  หมายเลขคดี, ผู้แจ้ง, วันเกิดเหตุ, ความเสียหาย, สถานะ
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={downloadingReports}
                onClick={() => handleDownload("reports")}
              >
                {downloadingReports ? "กำลังดาวน์โหลด..." : "⬇ ดาวน์โหลด"}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">บัญชีมิจฉาชีพ (Fraud Accounts)</div>
                <div className="text-xs text-muted-foreground">
                  เลขบัญชี, ธนาคาร, จำนวนครั้งที่โดนแจ้ง, ความเสียหายรวม
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={downloadingFraud}
                onClick={() => handleDownload("fraud-accounts")}
              >
                {downloadingFraud ? "กำลังดาวน์โหลด..." : "⬇ ดาวน์โหลด"}
              </Button>
            </div>

            <div className="flex justify-end pt-1">
              <Button variant="ghost" onClick={handleCloseDialog}>
                ปิด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Import Dialog ── */}
      <Dialog open={action === "import"} onOpenChange={(o) => !o && handleCloseDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>นำเข้าข้อมูลบัญชีมิจฉาชีพ</DialogTitle>
          <DialogDescription>
            อัพโหลดไฟล์ CSV ที่มีคอลัมน์: <code>accountNumber</code>,{" "}
            <code>bankName</code> (จำเป็น) — ข้อมูลที่มีอยู่แล้วจะถูกอัพเดท
          </DialogDescription>

          <div className="space-y-4 pt-1">
            {/* Step: idle / upload */}
            {(importStep === "idle" || importStep === "uploading") && (
              <>
                {/* Template download */}
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm">
                  <span className="flex-1 text-muted-foreground">
                    ยังไม่มี template? ดาวน์โหลดไฟล์ตัวอย่างก่อน
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadTemplate}
                  >
                    ⬇ Template
                  </Button>
                </div>

                {/* File upload area */}
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center transition hover:border-primary/50 hover:bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-2 text-3xl">📂</div>
                  <div className="text-sm font-medium">
                    {importStep === "uploading"
                      ? "กำลังอ่านไฟล์..."
                      : "คลิกเพื่อเลือกไฟล์ CSV"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    รองรับ .csv จาก Excel (UTF-8 / UTF-8 BOM)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={importStep === "uploading"}
                  />
                </div>

                {errorMsg && (
                  <div className="whitespace-pre-line rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMsg}
                  </div>
                )}
              </>
            )}

            {/* Step: preview */}
            {importStep === "preview" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    พบข้อมูล{" "}
                    <span className="font-semibold">{previewTotal} แถว</span>{" "}
                    {previewTotal > 5 && (
                      <span className="text-muted-foreground">
                        (แสดง 5 แถวแรก)
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">ตรวจสอบก่อน confirm</Badge>
                </div>

                {/* Preview table */}
                <div className="overflow-x-auto rounded-md border text-sm">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {["เลขบัญชี", "ธนาคาร", "ชื่อบัญชี", "เบอร์", "สถานะ"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.accountNumber}</td>
                          <td className="px-3 py-2">{row.bankName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.accountName || "-"}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.phoneNumber || "-"}</td>
                          <td className="px-3 py-2">
                            <Badge variant="secondary">{row.status || "pending"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {errorMsg && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={resetImport}>
                    เลือกไฟล์ใหม่
                  </Button>
                  <Button onClick={handleConfirmImport}>
                    ✓ ยืนยันนำเข้า {previewTotal} รายการ
                  </Button>
                </div>
              </>
            )}

            {/* Step: confirming */}
            {importStep === "confirming" && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <div className="text-sm text-muted-foreground">กำลังนำเข้าข้อมูล...</div>
              </div>
            )}

            {/* Step: done */}
            {importStep === "done" && importResult && (
              <>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950">
                  <div className="mb-1 text-2xl">✅</div>
                  <div className="font-semibold text-green-800 dark:text-green-300">
                    นำเข้าสำเร็จ
                  </div>
                  <div className="mt-2 flex justify-center gap-4 text-sm text-green-700 dark:text-green-400">
                    <span>เพิ่มใหม่: <strong>{importResult.inserted}</strong></span>
                    <span>อัพเดท: <strong>{importResult.updated}</strong></span>
                    <span>ทั้งหมด: <strong>{importResult.total}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetImport}>
                    นำเข้าไฟล์อื่น
                  </Button>
                  <Button onClick={handleCloseDialog}>ปิด</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
