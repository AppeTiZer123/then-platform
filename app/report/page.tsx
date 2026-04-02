"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Send,
  User,
  MessageSquareText,
  Upload,
  Check,
  AlertCircle,
  Bot,
  FileText,
  Sparkles,
  ImagePlus,
  Lock,
  FileDown,
  Loader2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const [step, setStep] = useState<
    "contact" | "story" | "processing" | "complete"
  >("contact");
  const [contactInfo, setContactInfo] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    email: "",
  }));
  const [story, setStory] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- My Documents ---
  interface MyReport {
    id: string;
    caseNumber: string;
    status: string | null;
    incidentDate: string | null;
    damageAmount: string | null;
    createdAt: string | null;
    canDownload: boolean;
  }
  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/reports/mine");
      if (res.ok) {
        const json = await res.json();
        setMyReports(json.data ?? []);
      }
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchMyReports();
  }, [isAuthenticated, fetchMyReports]);

  const handleRedownload = async (reportId: string, caseNumber: string) => {
    setDownloadingId(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`);
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ใบแจ้งความ_${caseNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDownloadingId(null);
    }
  };

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "pending": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">รอดำเนินการ</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">กำลังดำเนินการ</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">เสร็จสิ้น</Badge>;
      default: return <Badge variant="secondary" className="text-xs">{s}</Badge>;
    }
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">กำลังตรวจสอบ...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Redirect to login if not authenticated (middleware handles this but fallback)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">กรุณาเข้าสู่ระบบ</CardTitle>
              <CardDescription>
                คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถใช้งานระบบสร้างเอกสารได้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                หรือลองใช้{" "}
                <Link href="/ai-chat" className="text-primary underline">
                  AI ให้คำปรึกษา
                </Link>{" "}
                โดยไม่ต้องเข้าสู่ระบบ
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInfo.name && contactInfo.phone) {
      setStep("story");
    }
  };

  const handleStorySubmit = async () => {
    if (!story.trim()) return;

    setStep("processing");
    setProcessingStatus("กำลังวิเคราะห์ข้อมูลจากเรื่องเล่า...");

    try {
      // 1. Extract data using AI
      const extractResponse = await fetch("/api/ai/extract-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, contactInfo }),
      });

      if (!extractResponse.ok) throw new Error("Failed to extract data");

      const { data: extractedData } = await extractResponse.json();

      setProcessingStatus("กำลังสร้างเอกสาร PDF...");

      // 2. Convert รูปเป็น base64 (ถ้ามี)
      const base64Images: string[] = await Promise.all(
        evidenceFiles
          .filter((f) => f.type.startsWith("image/"))
          .map(
            (f) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(f);
              }),
          ),
      );

      // 3. Generate PDF พร้อมรูป
      const pdfResponse = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extractedData, evidence_images: base64Images }),
      });

      if (!pdfResponse.ok) throw new Error("Failed to generate PDF");

      const pdfBlob = await pdfResponse.blob();
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      setProcessingStatus("กำลังบันทึกข้อมูลเข้าระบบ...");

      // 4. Save report to DB
      const saveResponse = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData, contactInfo }),
      });

      const saveData = await saveResponse.json();
      const caseNumber = saveData.ok
        ? saveData.caseNumber
        : `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

      // 5. Upload evidence files ไป Supabase Storage (ถ้ามี)
      if (evidenceFiles.length > 0 && saveData.ok && saveData.reportId) {
        setProcessingStatus("กำลังอัปโหลดหลักฐาน...");
        const fd = new FormData();
        fd.append("reportId", saveData.reportId);
        evidenceFiles.forEach((f) => fd.append("files", f));
        await fetch("/api/reports/evidence", { method: "POST", body: fd });
      }

      setReferenceNumber(caseNumber);
      await fetchMyReports(); // refresh list
      setStep("complete");
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างเอกสาร กรุณาลองใหม่อีกครั้ง");
      setStep("story");
    }
  };

  // Step 1: Contact Info
  if (step === "contact") {
    return (
      <main className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  AI ช่วยสร้างเอกสาร
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                เล่าเรื่องราวของคุณ
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                แค่เล่าเหตุการณ์ที่เกิดขึ้น AI
                จะช่วยวิเคราะห์และสร้างเอกสารใบแจ้งความให้คุณอัตโนมัติ
              </p>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <p className="text-xs text-muted-foreground">
                  กรอกข้อมูลติดต่อ
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <p className="text-xs text-muted-foreground">เล่าเรื่องราว</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <p className="text-xs text-muted-foreground">รับเอกสาร</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  ข้อมูลติดต่อ
                </CardTitle>
                <CardDescription>
                  กรุณากรอกข้อมูลเพื่อให้เราติดต่อกลับได้
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      ชื่อ-นามสกุล *
                    </label>
                    <Input
                      placeholder="นายสมชาย ใจดี"
                      value={contactInfo.name}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      เบอร์โทรศัพท์ *
                    </label>
                    <Input
                      placeholder="081-234-5678"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      อีเมล (ไม่บังคับ)
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={contactInfo.email}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    ถัดไป
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* เอกสารของฉัน */}
            {myReports.some((r) => r.canDownload) && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  เอกสารของฉัน
                </h2>
                <div className="space-y-3">
                  {loadingReports ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    myReports.filter((r) => r.canDownload).map((r) => (
                      <Card key={r.id} className="border">
                        <CardContent className="py-4 px-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-mono font-semibold text-sm truncate">
                                {r.caseNumber}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {statusLabel(r.status)}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {r.createdAt
                                    ? new Date(r.createdAt).toLocaleDateString("th-TH", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </span>
                              </div>
                            </div>
                            {r.canDownload ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={downloadingId === r.id}
                                onClick={() => handleRedownload(r.id, r.caseNumber)}
                                className="shrink-0"
                              >
                                {downloadingId === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <FileDown className="mr-1.5 h-4 w-4" />
                                    ดาวน์โหลด PDF
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground shrink-0">ไม่มีไฟล์</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Step 2: Tell Your Story
  if (step === "story") {
    return (
      <main className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                เล่าเหตุการณ์ที่เกิดขึ้น
              </h1>
              <p className="text-muted-foreground">
                เล่าให้ละเอียดที่สุดเท่าที่จะทำได้ AI
                จะช่วยสรุปและสร้างเอกสารให้
              </p>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400">
                  ข้อมูลติดต่อ
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <p className="text-xs text-primary font-medium">
                  เล่าเรื่องราว
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <p className="text-xs text-muted-foreground">รับเอกสาร</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  เล่าเรื่องราวของคุณ
                </CardTitle>
                <CardDescription>
                  อธิบายเหตุการณ์ที่เกิดขึ้น เช่น ถูกหลอกอย่างไร ผ่านช่องทางไหน
                  เสียเงินไปเท่าไหร่
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <textarea
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="ตัวอย่าง: เมื่อวันที่ 5 ธันวาคม 2567 ผมเห็นโฆษณาขายโทรศัพท์มือถือราคาถูกในเพจ Facebook ชื่อ 'ร้านโทรศัพท์ราคาถูก' ราคา 5,000 บาท จึงได้ติดต่อไปทาง Line และโอนเงินให้ จำนวน 5,000 บาท ไปยังบัญชี xxx-x-xxxxx-x ธนาคารกสิกรไทย ชื่อบัญชี นายXXX XXX หลังจากโอนเงินแล้ว ผู้ขายก็บล็อคและหายไป ไม่สามารถติดต่อได้..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                  />
                </div>

                {/* Tips */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-2">เคล็ดลับการเล่าเรื่อง:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• ระบุวันเวลาที่เกิดเหตุ</li>
                        <li>• บอกจำนวนเงินที่เสียไป</li>
                        <li>
                          • ระบุช่องทางการติดต่อ (Facebook, Line, เบอร์โทร)
                        </li>
                        <li>• หมายเลขบัญชีที่โอนเงินไป</li>
                        <li>• ลำดับเหตุการณ์ที่เกิดขึ้น</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upload Evidence */}
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selected = Array.from(e.target.files ?? []);
                      setEvidenceFiles((prev) => {
                        const existing = new Set(prev.map((f) => f.name));
                        return [...prev, ...selected.filter((f) => !existing.has(f.name))];
                      });
                    }}
                  />
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">แนบรูปหลักฐาน (ไม่บังคับ)</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    รูปภาพ (JPG, PNG, WEBP) หรือ PDF — ไม่เกิน 10MB/ไฟล์
                  </p>
                  <Button variant="outline" size="sm" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    เลือกไฟล์
                  </Button>

                  {/* Preview รายชื่อไฟล์ที่เลือก */}
                  {evidenceFiles.length > 0 && (
                    <ul className="mt-4 text-left space-y-1">
                      {evidenceFiles.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs bg-muted rounded px-3 py-1.5"
                        >
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEvidenceFiles((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("contact")}
                    className="flex-1"
                  >
                    ย้อนกลับ
                  </Button>
                  <Button
                    onClick={handleStorySubmit}
                    disabled={!story.trim()}
                    className="flex-1"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    ให้ AI สร้างเอกสาร
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Step 3: AI Processing
  if (step === "processing") {
    return (
      <main className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-12 pb-12">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-10 w-10 text-primary-foreground animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">AI กำลังทำงาน...</h2>
              <p className="text-muted-foreground text-sm">
                {processingStatus}
              </p>
              <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                <div
                  className={`flex items-center gap-2 text-sm ${processingStatus.includes("วิเคราะห์") ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  {processingStatus.includes("วิเคราะห์") ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  <span>วิเคราะห์ข้อมูลจากเรื่องเล่า</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${processingStatus.includes("สร้างเอกสาร") ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  {processingStatus.includes("สร้างเอกสาร") ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : processingStatus.includes("วิเคราะห์") ? (
                    <div className="h-4 w-4 bg-muted rounded-full" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  <span>สร้างเอกสาร PDF</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    );
  }

  // Step 4: Complete
  if (step === "complete") {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400">
                สร้างเอกสารสำเร็จ!
              </CardTitle>
              <CardDescription>
                AI ได้วิเคราะห์เรื่องราวและสร้างเอกสารใบแจ้งความให้คุณแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">หมายเลขอ้างอิง</p>
                <p className="text-xl font-bold text-primary">
                  {referenceNumber}
                </p>
              </div>

              {pdfUrl && (
                <Button className="w-full" size="lg" asChild>
                  <a
                    href={pdfUrl}
                    download={`ใบแจ้งความ_${referenceNumber}.pdf`}
                  >
                    <Upload className="mr-2 h-4 w-4 rotate-180" />
                    ดาวน์โหลดเอกสาร PDF
                  </a>
                </Button>
              )}

              <div className="bg-primary/5 rounded-lg p-4 text-left mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">ขั้นตอนถัดไป:</p>
                    <p className="text-muted-foreground">
                      คุณสามารถนำไฟล์ PDF
                      นี้ไปพิมพ์เพื่อใช้ประกอบการแจ้งความที่สถานีตำรวจได้ทันที
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">กลับหน้าแรก</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  return null; // Should not reach here
}
