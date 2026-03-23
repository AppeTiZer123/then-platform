"use client";

import React, { useState } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";

type ActionType = "backup" | "import" | "export" | null;

async function exportReportsAsCSV() {
  const res = await fetch("/api/admin/reports");
  if (!res.ok) throw new Error("Failed to fetch reports");
  const json = await res.json();
  const reports: Record<string, unknown>[] = json.data || [];

  const headers = [
    "caseNumber",
    "reporterName",
    "reporterPhone",
    "incidentDate",
    "damageAmount",
    "status",
    "createdAt",
  ];
  const rows = reports.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `then-reports-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataManagement() {
  const [action, setAction] = useState<ActionType>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportReportsAsCSV();
      setAction(null);
    } catch {
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>การจัดการข้อมูล</CardTitle>
          <CardDescription>
            สำรองข้อมูล นำเข้า/ส่งออก และการตั้งค่า DB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">สำรองข้อมูล (Backup)</div>
              <Button size="sm" onClick={() => setAction("backup")}>
                เริ่ม
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">นำเข้า/ส่งออกข้อมูล</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setAction("import")}>
                  นำเข้า
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAction("export")}
                >
                  ส่งออก
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>
            {action === "backup"
              ? "สำรองข้อมูล"
              : action === "import"
                ? "นำเข้าข้อมูล"
                : action === "export"
                  ? "ส่งออกข้อมูล"
                  : "จัดการข้อมูล"}
          </DialogTitle>
          <DialogDescription className="mb-4">
            {action === "backup" &&
              "สำรองข้อมูลระบบ (ยังไม่รองรับ — ต้องตั้งค่า Backup storage ก่อน)"}
            {action === "import" &&
              "นำเข้าข้อมูล (ยังไม่รองรับ — กรุณาติดต่อ DBA เพื่อ import โดยตรง)"}
            {action === "export" &&
              "ส่งออกรายงานทั้งหมดจากฐานข้อมูลเป็นไฟล์ CSV"}
          </DialogDescription>

          {(action === "backup" || action === "import") && (
            <div className="space-y-3">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                ฟีเจอร์นี้ยังไม่พร้อมใช้งานในเวอร์ชันปัจจุบัน
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAction(null)}>
                  ปิด
                </Button>
              </div>
            </div>
          )}

          {action === "export" && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                ไฟล์ CSV จะประกอบด้วย:หมายเลขคดี, ชื่อผู้แจ้ง, เบอร์โทร,
                วันเกิดเหตุ, ความเสียหาย, สถานะ, วันที่แจ้ง
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAction(null)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "กำลังส่งออก..." : "ดาวน์โหลด CSV"}
                </Button>
              </div>
            </div>
          )}

          <DialogClose asChild>
            <button className="sr-only">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
