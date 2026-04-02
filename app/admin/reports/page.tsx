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
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const STATUS_TABS = [
  { value: "completed", label: "ออกเอกสารแล้ว" },
  { value: "tip",       label: "แจ้งเบาะแส" },
] as const;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "tip":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">แจ้งเบาะแส</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">รอดำเนินการ</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">กำลังดำเนินการ</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ออกเอกสารแล้ว</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("completed");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setMenuReadyId(null);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenuId, searchParams]);

  interface Report {
    id: string;
    caseNumber: string;
    reporterName: string;
    reporterPhone: string;
    incidentDate: string;
    damageAmount: number;
    status: string;
    assignedOfficerId?: string | null;
    assignedOfficerName?: string | null;
    [key: string]: string | number | boolean | null | undefined;
  }
  
  const [reports, setReports] = useState<Report[]>(mockReports as unknown as Report[]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/admin/reports');
        const json = await res.json();
        if (json?.ok && Array.isArray(json.data)) {
          setReports(json.data as Report[]);
        } else {
          setApiError(json?.message || json?.error || 'Failed to load from API');
          setReports(mockReports as unknown as Report[]);
        }
      } catch (err: unknown) {
        console.error('Error fetching reports API:', err);
        setApiError(err instanceof Error ? err.message : String(err));
        setReports(mockReports as unknown as Report[]);
      } finally {
        // isLoading was unused, so removed
      }
    }
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const caseNum = report.caseNumber || (report.case_number as string) || (report.case as string) || "";
    const name = report.reporterName || (report.reporter_name as string) || "";
    
    const matchesSearch =
      caseNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedReport = openReportId ? (reports || []).find((r) => r.id === openReportId) || null : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">รายการแจ้งความทั้งหมด</h2>
          <p className="text-sm text-muted-foreground">จัดการและติดตามคดีที่แจ้งเข้ามา</p>
        </div>
      </div>

      {/* Status Tabs + Search */}
      <Card>
        <div className="border-b border-border px-2">
          <div className="flex overflow-x-auto -mb-px scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const count = reports.filter((r) => r.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาหมายเลขคดี หรือ ชื่อผู้แจ้ง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      {apiError && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-100">มีปัญหาในการดึงข้อมูลจากฐานข้อมูล: {apiError}</div>
      )}
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
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">เจ้าหน้าที่</th>
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
                      {getStatusBadge(report.status as string)}
                    </td>
                    <td className="py-5 px-6 align-middle hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {(report.assignedOfficerName as string) ?? "—"}
                      </span>
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
                                setMenuReadyId(null);
                              } else {
                                // open -> start animating
                                setOpenMenuId(report.id);
                                setMenuReadyId(null);
                                // after animation duration, mark ready (allow clicks)
                                window.setTimeout(() => {
                                  setMenuReadyId(report.id);
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
          {selectedReport ? (
            (() => {
              const rpt = selectedReport;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">หมายเลขคดี</p>
                      <p className="text-lg font-semibold">{(rpt.caseNumber as string) ?? (rpt.case_number as string) ?? (rpt.case as string)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">ผู้แจ้ง</p>
                      <p className="font-medium">{(rpt.reporterName as string) ?? (rpt.reporter_name as string) ?? 'ผู้เสียหาย'}</p>
                      <p className="text-xs text-muted-foreground">{(rpt.reporterPhone as string) ?? (rpt.reporter_phone as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">ชื่อ - นามสกุล</p>
                      <p className="font-medium">{(rpt.reporterName as string) ?? (rpt.reporter_name as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">เลขบัตรประชาชน</p>
                      <p className="font-medium">{(rpt.idCard as string) ?? (rpt.id_card as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">ยอดโอน</p>
                      <p className="font-medium text-destructive">{formatCurrency(Number((rpt.transferAmount as number) ?? (rpt.damageAmount as number) ?? (rpt.damage_amount as number) ?? 0))}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">สินค้าที่สั่งซื้อ</p>
                      <p className="font-medium">{(rpt.productOrdered as string) ?? (rpt.product as string) ?? (rpt.item as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">เลขบัญชี</p>
                      <p className="font-medium">{(rpt.accountNumber as string) ?? (rpt.account_number as string) ?? (rpt.suspect_account as string) ?? '-'}</p>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">เพจขายของ</p>
                      <p className="font-medium">{(rpt.sellerPage as string) ?? (rpt.seller_page as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">วันโอนเงิน</p>
                      <p className="font-medium">{formatDate((rpt.transferDate as string) ?? (rpt.transfer_date as string) ?? (rpt.incidentDate as string) ?? (rpt.incident_date as string))}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">วันที่ลงประกาศ</p>
                      <p className="font-medium">{formatDate((rpt.postDate as string) ?? (rpt.post_date as string))}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">รายละเอียดเพิ่มเติม</p>
                      <p className="text-sm">{(rpt.moreDetails as string) ?? (rpt.incidentDetails as string) ?? (rpt.incident_details as string) ?? '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">วันเกิดเหตุ</p>
                      <p className="font-medium">{formatDate((rpt.incidentDate as string) ?? (rpt.incident_date as string))}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">ความเสียหายโดยประมาณ</p>
                      <p className="text-lg font-semibold text-destructive">{formatCurrency(Number((rpt.damageAmount as number) ?? (rpt.damage_amount as number) ?? 0))}</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">ปิด</Button>
                      </DialogClose>
                      <Button onClick={() => { alert('ตัวอย่าง: ส่งข้อความถึงผู้แจ้ง'); }}>ส่งข้อความ</Button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div>ไม่พบข้อมูลคดี</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
