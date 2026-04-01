"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ReportDetail {
  id: string;
  caseNumber: string;
  reporterName: string;
  reporterPhone?: string | null;
  incidentDate?: string | null;
  incidentDetails?: string | null;
  damageAmount?: string | null;
  status?: string | null;
}

interface OfficerItem {
  id: string;
  userId?: string | null;
  rank?: string | null;
  department?: string | null;
  isActive: boolean;
  createdAt: string;
  // joined from users table (populated if backend joins)
  name?: string | null;
  phone?: string | null;
}

export default function AssignOfficerPage() {
  const router = useRouter();
  const params = useParams() as { id: string } | null;
  const reportId = params?.id || "";

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [officersLoading, setOfficersLoading] = useState(true);

  // โหลดข้อมูล report
  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/admin/reports/${reportId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data) setReport(j.data as ReportDetail);
      })
      .catch(() => {});
  }, [reportId]);

  // โหลด officers จาก API
  useEffect(() => {
    setOfficersLoading(true);
    fetch("/api/admin/officers")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data)) {
          setOfficers(j.data as OfficerItem[]);
        }
      })
      .catch(() => {})
      .finally(() => setOfficersLoading(false));
  }, []);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [officerView, setOfficerView] = useState<OfficerItem | null>(null);

  const [query, setQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerItem | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = officers.filter((o) => {
    const nameMatch = (o.name ?? "").toLowerCase().includes(query.toLowerCase());
    const rankMatch = (o.rank ?? "").toLowerCase().includes(query.toLowerCase());
    const deptMatch = (o.department ?? "").toLowerCase().includes(query.toLowerCase());
    return nameMatch || rankMatch || deptMatch;
  });

  function getInitials(name?: string | null): string {
    if (!name) return "??";
    return name
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0] ?? "")
      .join("");
  }

  async function handleAssign() {
    if (!selectedOfficer) return alert("โปรดเลือกเจ้าหน้าที่ก่อน");
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedOfficerId: selectedOfficer.id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "API error");
      router.push("/admin/reports");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-2">มอบหมายเจ้าหน้าที่</h1>
      <p className="text-sm text-muted-foreground mb-6">
        กำหนดเจ้าหน้าที่รับผิดชอบคดี และรายละเอียดการมอบหมาย
      </p>

      <Card>
        <CardContent>
          <div className="md:flex md:gap-6">
            {/* Left: officer search & list */}
            <div className="md:w-1/3">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">หมายเลขคดี</p>
                <button
                  className="font-medium text-left text-primary hover:underline"
                  onClick={() => setShowReportDialog(true)}
                >
                  {report?.caseNumber ?? `#${reportId}`}
                </button>
              </div>

              <label className="text-sm text-muted-foreground">
                ค้นหา/เลือกเจ้าหน้าที่
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="พิมพ์ชื่อ ยศ หรือหน่วยงาน..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  onClick={() => {
                    setQuery("");
                    setSelectedOfficer(null);
                  }}
                  title="ล้าง"
                >
                  ล้าง
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-auto">
                {officersLoading && (
                  <div className="text-sm text-muted-foreground p-3">กำลังโหลด...</div>
                )}
                {!officersLoading && filtered.map((o) => {
                  const selected = selectedOfficer?.id === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOfficer(o)}
                      className={`w-full flex items-center gap-3 p-3 rounded-md text-left border ${selected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/50"}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                        {getInitials(o.name)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{o.name ?? "(ไม่มีชื่อ)"}</div>
                        <div className="text-xs text-muted-foreground">
                          {[o.rank, o.department].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            o.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-muted-foreground"
                          }`}
                        >
                          {o.isActive ? "ว่าง" : "ไม่ว่าง"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOfficerView(o);
                          }}
                          className="p-2 rounded-md hover:bg-muted/50"
                          title="ดูเจ้าหน้าที่"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                  );
                })}
                {!officersLoading && filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground p-3">
                    ไม่พบเจ้าหน้าที่
                  </div>
                )}
              </div>
            </div>

            {/* Right: assignment details */}
            <div className="md:w-2/3 mt-9 md:mt-0">
              <div className="p-4 border border-border rounded-md">
                <p className="text-sm text-muted-foreground">ผู้ถูกเลือก</p>
                {selectedOfficer ? (
                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                      {getInitials(selectedOfficer.name)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{selectedOfficer.name ?? "(ไม่มีชื่อ)"}</div>
                      <div className="text-xs text-muted-foreground">
                        {[selectedOfficer.rank, selectedOfficer.department]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">
                    ยังไม่ได้เลือกเจ้าหน้าที่
                  </div>
                )}

                <div className="mt-4">
                  <label className="text-sm text-muted-foreground">
                    บันทึกเพิ่มเติม
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[92px]"
                    placeholder="รายละเอียดเพิ่มเติมสำหรับเจ้าหน้าที่..."
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedOfficer || isSubmitting}
                  >
                    {isSubmitting
                      ? "กำลังบันทึก..."
                      : selectedOfficer
                      ? "มอบหมาย"
                      : "เลือกเจ้าหน้าที่ก่อน"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report detail dialog */}
      <Dialog
        open={showReportDialog}
        onOpenChange={(open) => setShowReportDialog(open)}
      >
        <DialogContent>
          <DialogTitle>รายละเอียดคดี</DialogTitle>
          <DialogDescription className="mb-4">
            ข้อมูลคดีสำหรับหมายเลขที่เลือก
          </DialogDescription>
          {report ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">หมายเลขคดี</p>
                <p className="font-medium">{report.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ผู้แจ้ง</p>
                <p className="font-medium">
                  {report.reporterName} — {report.reporterPhone}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันเกิดเหตุ</p>
                <p className="font-medium">{report.incidentDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">รายละเอียด</p>
                <p className="text-sm">{report.incidentDetails}</p>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">ปิด</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    setShowReportDialog(false);
                    router.push(`/report/track?case=${report.caseNumber}`);
                  }}
                >
                  ไปยังหน้าติดตาม
                </Button>
              </div>
            </div>
          ) : (
            <div>ไม่พบข้อมูลคดี</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Officer detail dialog */}
      <Dialog
        open={!!officerView}
        onOpenChange={(open) => {
          if (!open) setOfficerView(null);
        }}
      >
        <DialogContent>
          <DialogTitle>ข้อมูลเจ้าหน้าที่</DialogTitle>
          <DialogDescription className="mb-4">
            รายละเอียดเจ้าหน้าที่
          </DialogDescription>
          {officerView ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                  {getInitials(officerView.name)}
                </div>
                <div>
                  <div className="font-medium">{officerView.name ?? "(ไม่มีชื่อ)"}</div>
                  <div className="text-xs text-muted-foreground">
                    {officerView.rank ?? "—"}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">หน่วยงาน</p>
                <p className="font-medium">{officerView.department ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">สถานะ</p>
                <p className="font-medium">{officerView.isActive ? "ว่าง" : "ไม่ว่าง"}</p>
              </div>
              <div className="pt-4 flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">ปิด</Button>
                </DialogClose>
              </div>
            </div>
          ) : (
            <div>ไม่พบข้อมูล</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
