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

export default function DataManagement() {
  const [action, setAction] = useState<ActionType>(null);

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
              ? "นำเข้า"
              : action === "export"
              ? "ส่งออก"
              : "ตัวอย่าง"}
          </DialogTitle>
          <DialogDescription className="mb-4">
            {action === "backup" &&
              "ขั้นตอนการสำรองข้อมูล: สร้างไฟล์ .zip ที่ประกอบด้วยฐานข้อมูลและไฟล์สื่อ เพื่อดาวน์โหลดเก็บสำรอง"}
            {action === "import" &&
              "การนำเข้า: อัปโหลดไฟล์ CSV/JSON  และแสดงตัวอย่างแถวข้อมูลก่อนนำเข้า"}
            {action === "export" &&
              "การส่งออก: เลือกรูปแบบไฟล์ (CSV/JSON) และดูตัวอย่างข้อมูลที่จะถูกส่งออก"}
          </DialogDescription>

          {action === "backup" && (
            <div className="space-y-3">
              <div className="text-sm">ชื่อไฟล์ที่สร้าง:</div>
              <div className="rounded-md border border-border bg-slate-50 p-3 font-mono text-sm">
                then-backup-2025-12-19.zip
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAction(null)}>
                  ปิด
                </Button>
                <Button
                  onClick={() =>
                    alert(
                      "ดาวน์โหลดตัวอย่างสำรอง: then-backup-2025-12-19.zip (จำลอง)"
                    )
                  }
                >
                  ดาวน์โหลด
                </Button>
              </div>
            </div>
          )}

          {action === "import" && (
            <div className="space-y-3">
              <div className="text-sm">ตัวอย่างไฟล์ (CSV):</div>
              <pre className="rounded-md border border-border bg-slate-50 p-3 text-sm overflow-auto whitespace-pre-wrap break-words font-mono">
                id,name,email 1,สมชาย,sch@sample.test 2,สมหญิง,sh@sample.test
              </pre>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAction(null)}>
                  ปิด
                </Button>
                <Button onClick={() => alert("อัปโหลดตัวอย่าง (จำลอง)")}>
                  อัปโหลด
                </Button>
              </div>
            </div>
          )}

          {action === "export" && (
            <div className="space-y-3">
              <div className="text-sm">ตัวเลือกการส่งออก:</div>
              <ul className="list-disc pl-5 text-sm">
                <li>ฟิลด์: id, name, email</li>
                <li>รูปแบบไฟล์: CSV</li>
                <li>ตัวอย่างแถว: 1,สมชาย,sch@sample.test</li>
              </ul>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAction(null)}>
                  ปิด
                </Button>
                <Button
                  onClick={() => alert("ดาวน์โหลดตัวอย่างส่งออก (จำลอง)")}
                >
                  ดาวน์โหลด
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
