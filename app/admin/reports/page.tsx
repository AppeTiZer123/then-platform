"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { mockReports, formatCurrency, formatDate } from "@/lib/mock-data";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอดำเนินการ</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">กำลังดำเนินการ</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">เสร็จสิ้น</Badge>;
    case "rejected":
      return <Badge variant="destructive">ยกเลิก</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnimatingId, setMenuAnimatingId] = useState<string | null>(null);
  const [menuReadyId, setMenuReadyId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // initialize filters from URL params (e.g. ?status=pending&q=...)
    const statusParam = searchParams?.get("status");
    const qParam = searchParams?.get("q");
    if (statusParam) setStatusFilter(statusParam);
    if (qParam) setSearchQuery(qParam);

    function handleDocClick(e: MouseEvent) {
      if (!openMenuId) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btnSel = `[data-menu-button="${openMenuId}"]`;
      const menuSel = `[data-menu-id="${openMenuId}"]`;
      if (!target.closest(btnSel) && !target.closest(menuSel)) {
        setOpenMenuId(null);
        setMenuReadyId(null);
        setMenuAnimatingId(null);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setMenuReadyId(null);
        setMenuAnimatingId(null);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenuId]);

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = 
      report.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">รายการแจ้งความทั้งหมด</h2>
          <p className="text-sm text-muted-foreground">จัดการและติดตามคดีที่แจ้งเข้ามา</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหมายเลขคดี หรือ ชื่อผู้แจ้ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">หมายเลขคดี</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">ผู้แจ้ง</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">วันเกิดเหตุ</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground hidden sm:table-cell">ความเสียหาย</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">สถานะ</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border last:border-0 hover:bg-muted/50 even:bg-muted/10">
                    <td className="py-5 px-6 align-middle">
                      <button className="font-medium text-sm text-primary hover:underline hover:bg-accent/5 hover:rounded px-1 transition" onClick={() => setOpenReportId(report.id)}>{report.caseNumber}</button>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <div>
                        <p className="text-sm font-medium">{report.reporterName}</p>
                        <p className="text-xs text-muted-foreground">{report.reporterPhone}</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 align-middle hidden md:table-cell">
                      <span className="text-sm">{formatDate(report.incidentDate)}</span>
                    </td>
                    <td className="py-5 px-6 align-middle hidden sm:table-cell">
                      <span className="text-sm font-medium text-destructive">
                        {formatCurrency(report.damageAmount)}
                      </span>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-5 px-6 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpenReportId(report.id)}
                          aria-label={`ดู ${report.caseNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-menu-button={report.id}
                            className={`rounded-full ${openMenuId === report.id ? 'bg-primary/10 text-primary' : ''}`}
                            onClick={() => {
                              if (openMenuId === report.id) {
                                // close
                                setOpenMenuId(null);
                                setMenuAnimatingId(null);
                                setMenuReadyId(null);
                              } else {
                                // open -> start animating
                                setOpenMenuId(report.id);
                                setMenuAnimatingId(report.id);
                                setMenuReadyId(null);
                                // after animation duration, mark ready (allow clicks)
                                window.setTimeout(() => {
                                  setMenuReadyId(report.id);
                                  setMenuAnimatingId(null);
                                }, 180);
                              }
                            }}
                            aria-expanded={openMenuId === report.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {openMenuId === report.id && (
                            <div
                              data-menu-id={report.id}
                              className={
                                `absolute right-0 mt-2 w-44 bg-popover rounded-lg shadow-lg ring-1 ring-black/5 z-40 transform transition-all duration-180 ease-out ` +
                                (menuReadyId === report.id
                                  ? "translate-y-0 opacity-100 pointer-events-auto"
                                  : "-translate-y-1 opacity-0 pointer-events-none")
                              }
                              role="menu"
                            >
                              {/* caret */}
                              <div className="absolute -top-2 right-4 w-3 h-3 bg-popover transform rotate-45 shadow-sm" />
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-muted"
                                onClick={() => { setOpenReportId(report.id); setOpenMenuId(null); }}
                              >
                                ดูรายละเอียด
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-muted"
                                onClick={() => { router.push(`/admin/reports/${report.id}/assign`); setOpenMenuId(null); }}
                              >
                                มอบหมายเจ้าหน้าที่
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-destructive hover:bg-muted"
                                onClick={() => { alert('ลบตัวอย่าง (ยังไม่ได้เชื่อม)'); setOpenMenuId(null); }}
                              >
                                ลบ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>ไม่พบรายการที่ค้นหา</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              แสดง {filteredReports.length} รายการ
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">หน้า 1 / 1</span>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openReportId} onOpenChange={(open) => { if (!open) setOpenReportId(null); }}>
        <DialogContent>
          <DialogTitle>รายละเอียดคดี</DialogTitle>
          <DialogDescription className="mb-4">ข้อมูลตัวอย่างสำหรับรายการแจ้งความ</DialogDescription>
          {openReportId && (
            (() => {
              const rpt = mockReports.find((r) => r.id === openReportId)!;
              return (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">หมายเลขคดี</p>
                    <p className="font-medium">{rpt.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ผู้แจ้ง</p>
                    <p className="font-medium">{rpt.reporterName} — {rpt.reporterPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">วันเกิดเหตุ</p>
                    <p className="font-medium">{formatDate(rpt.incidentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ความเสียหายโดยประมาณ</p>
                    <p className="font-medium text-destructive">{formatCurrency(rpt.damageAmount)}</p>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">ปิด</Button>
                    </DialogClose>
                    <Button onClick={() => { alert('ตัวอย่าง: ส่งข้อความถึงผู้แจ้ง'); }}>ส่งข้อความ</Button>
                  </div>
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
