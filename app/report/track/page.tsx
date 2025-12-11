"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { mockReports, formatDate, formatCurrency } from "@/lib/mock-data";

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

export default function TrackReportPage() {
  const [caseNumber, setCaseNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<typeof mockReports[0] | null | undefined>(undefined);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim()) return;

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const found = mockReports.find((r) => 
      r.caseNumber.toLowerCase() === caseNumber.toLowerCase()
    );
    setResult(found || null);
    setIsSearching(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              ติดตามสถานะคดี
            </h1>
            <p className="text-muted-foreground">
              กรอกหมายเลขอ้างอิงเพื่อตรวจสอบความคืบหน้า
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="หมายเลขอ้างอิง เช่น RPT-2024-0001"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isSearching || !caseNumber.trim()}>
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "ค้นหา"}
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground mt-3">
                ลองค้นหา: <button onClick={() => setCaseNumber("RPT-2024-0001")} className="text-primary hover:underline">RPT-2024-0001</button>, 
                <button onClick={() => setCaseNumber("RPT-2024-0002")} className="text-primary hover:underline ml-1">RPT-2024-0002</button>, หรือ 
                <button onClick={() => setCaseNumber("RPT-2024-0003")} className="text-primary hover:underline ml-1">RPT-2024-0003</button>
              </p>
            </CardContent>
          </Card>

          {/* Results */}
          {isSearching && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">กำลังค้นหา...</span>
              </CardContent>
            </Card>
          )}

          {!isSearching && result === null && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
              <CardContent className="flex items-start gap-4 py-6">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    ไม่พบข้อมูล
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    ไม่พบคดีหมายเลข &quot;{caseNumber}&quot; กรุณาตรวจสอบหมายเลขอ้างอิงอีกครั้ง
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isSearching && result && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{result.caseNumber}</CardTitle>
                    <CardDescription>แจ้งเมื่อ {formatDate(result.createdAt)}</CardDescription>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">รับแจ้งความ</p>
                      <p className="text-xs text-muted-foreground">{formatDate(result.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      result.status !== "pending" 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-muted"
                    }`}>
                      {result.status !== "pending" 
                        ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        : <Clock className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">มอบหมายเจ้าหน้าที่</p>
                      {result.assignedOfficer && (
                        <p className="text-xs text-muted-foreground">{result.assignedOfficer}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      result.status === "completed" 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-muted"
                    }`}>
                      {result.status === "completed"
                        ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        : <Clock className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">ดำเนินการเสร็จสิ้น</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">รายละเอียดคดี</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">วันเกิดเหตุ:</span>
                      <p className="font-medium">{formatDate(result.incidentDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ความเสียหาย:</span>
                      <p className="font-medium text-destructive">{formatCurrency(result.damageAmount)}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">รายละเอียด:</span>
                    <p className="mt-1">{result.incidentDetails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
