"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { mockReports } from "@/lib/mock-data";

const mockOfficers = [
  { id: "off-1", name: "พ.ต.ท. สมชาย รักษาความ", title: "หัวหน้าสอบสวน", phone: "081-900-1111", avail: "ว่าง" },
  { id: "off-2", name: "ร.ต.อ. สมหญิง ใจดี", title: "เจ้าหน้าที่สืบสวน", phone: "082-777-2222", avail: "ไม่ว่าง" },
  { id: "off-3", name: "ด.ต. สมศักดิ์ ตรวจงาน", title: "สนับสนุน", phone: "083-333-4444", avail: "ว่าง" },
];

export default function AssignOfficerPage() {
  const router = useRouter();
  const params = useParams() as { id: string } | null;
  const reportId = params?.id || "";

  const report = mockReports.find((r) => r.id === reportId);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [officerView, setOfficerView] = useState<typeof mockOfficers[number] | null>(null);

  const [query, setQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<typeof mockOfficers[number] | null>(null);
  const [role, setRole] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = mockOfficers.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) || o.title.toLowerCase().includes(query.toLowerCase())
  );

  function handleAssign() {
    if (!selectedOfficer) return alert("โปรดเลือกเจ้าหน้าที่ก่อน");
    // In real app: call action to persist assignment
    alert(`มอบหมาย ${report?.caseNumber || reportId} ให้ ${selectedOfficer.name} (บทบาท: ${role || '-'})`);
    router.push("/admin/reports");
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
                <button className="font-medium text-left text-primary hover:underline" onClick={() => setShowReportDialog(true)}>
                  {report?.caseNumber ?? `#${reportId}`}
                </button>
              </div>

              <label className="text-sm text-muted-foreground">ค้นหา/เลือกเจ้าหน้าที่</label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="พิมพ์ชื่อหรือบทบาท..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  onClick={() => { setQuery(''); setSelectedOfficer(null); }}
                  title="ล้าง"
                >
                  ล้าง
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-auto">
                {filtered.map((o) => {
                  const selected = selectedOfficer?.id === o.id;
                  const initials = o.name.split(' ').slice(0,2).map(s=>s[0]).join('');
                  return (
                    <button
                      key={o.id}
                      onClick={() => { setSelectedOfficer(o); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-md text-left border ${selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">{initials}</div>
                      <div className="flex-1">
                        <div className="font-medium">{o.name}</div>
                        <div className="text-xs text-muted-foreground">{o.title} · {o.phone}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${o.avail === 'ว่าง' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-muted-foreground'}`}>{o.avail}</span>
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOfficerView(o); }}
                          className="p-2 rounded-md hover:bg-muted/50"
                          title="ดูเจ้าหน้าที่"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground p-3">ไม่พบเจ้าหน้าที่</div>
                )}
              </div>
            </div>

            {/* Right: assignment details */}
            <div className="md:w-2/3 mt-9 md:mt-0">
              <div className="p-4 border border-border rounded-md">
                <p className="text-sm text-muted-foreground">ผู้ถูกเลือก</p>
                {selectedOfficer ? (
                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">{(selectedOfficer.name || '').split(' ').slice(0,2).map(s=>s[0]||'').join('')}</div>
                    <div className="flex-1">
                      <div className="font-medium">{selectedOfficer.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedOfficer.title} · {selectedOfficer.phone}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">ยังไม่ได้เลือกเจ้าหน้าที่</div>
                )}

                <div className="mt-4">
                  <label className="text-sm text-muted-foreground">บทบาท/หมายเหตุสั้น</label>
                  <Input placeholder="เช่น: สอบสวน, ตรวจสอบบัญชี" value={role} onChange={(e)=>setRole(e.target.value)} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-sm text-muted-foreground">ความสำคัญ</label>
                    <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="mt-2 h-9 rounded-md border border-input bg-background px-3 text-sm w-full">
                      <option value="low">ปกติ</option>
                      <option value="normal">สำคัญ</option>
                      <option value="high">ด่วน</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">กำหนดเสร็จภายใน</label>
                    <Input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="mt-2" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">สถานะเริ่มต้น</label>
                    <select className="mt-2 h-9 rounded-md border border-input bg-background px-3 text-sm w-full">
                      <option>กำลังดำเนินการ</option>
                      <option>รอดำเนินการ</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm text-muted-foreground">บันทึกเพิ่มเติม</label>
                  <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[92px]" placeholder="รายละเอียดเพิ่มเติมสำหรับเจ้าหน้าที่..." />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
                  <Button onClick={handleAssign} disabled={!selectedOfficer}>{selectedOfficer ? 'มอบหมาย' : 'เลือกเจ้าหน้าที่ก่อน'}</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report detail dialog */}
      <Dialog open={showReportDialog} onOpenChange={(open) => setShowReportDialog(open)}>
        <DialogContent>
          <DialogTitle>รายละเอียดคดี</DialogTitle>
          <DialogDescription className="mb-4">ข้อมูลคดีสำหรับหมายเลขที่เลือก</DialogDescription>
          {report ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">หมายเลขคดี</p>
                <p className="font-medium">{report.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ผู้แจ้ง</p>
                <p className="font-medium">{report.reporterName} — {report.reporterPhone}</p>
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
                <Button onClick={() => { setShowReportDialog(false); router.push(`/report/track?case=${report.caseNumber}`); }}>ไปยังหน้าติดตาม</Button>
              </div>
            </div>
          ) : (
            <div>ไม่พบข้อมูลคดี</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Officer detail dialog */}
      <Dialog open={!!officerView} onOpenChange={(open) => { if (!open) setOfficerView(null); }}>
        <DialogContent>
          <DialogTitle>ข้อมูลเจ้าหน้าที่</DialogTitle>
          <DialogDescription className="mb-4">รายละเอียดเจ้าหน้าที่</DialogDescription>
          {officerView ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">{(officerView.name||'').split(' ').slice(0,2).map(s=>s[0]||'').join('')}</div>
                <div>
                  <div className="font-medium">{officerView.name}</div>
                  <div className="text-xs text-muted-foreground">{officerView.title}</div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                <p className="font-medium">{officerView.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">สถานะ</p>
                <p className="font-medium">{officerView.avail}</p>
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
