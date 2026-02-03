"use client";

import { useState } from "react";
import Link from "next/link";
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
import { FileText, Download, Loader2, ArrowLeft, TestTube } from "lucide-react";
import type { IncidentReportData } from "@/types/pdf-report";
import { emptyIncidentReportData } from "@/types/pdf-report";

export default function ManualReportPage() {
  const [formData, setFormData] =
    useState<IncidentReportData>(emptyIncidentReportData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          report_date:
            formData.report_date ||
            new Date().toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Download PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ใบแจ้งเหตุ_${formData.fullname || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestSample = () => {
    // Open sample PDF in new tab
    window.open("/api/pdf/generate", "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/report"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับไปแจ้งความแบบ AI
              </Link>
              <h1 className="text-2xl font-bold">
                สร้างเอกสาร PDF (Manual Form)
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                สำหรับทดสอบ PDF generation - กรอกข้อมูลเองทั้งหมด
              </p>
            </div>
            <Button variant="outline" onClick={handleTestSample}>
              <TestTube className="mr-2 h-4 w-4" />
              ทดสอบด้วย Sample Data
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="grid gap-6">
            {/* Section 1: ข้อมูลผู้เสียหาย */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    1
                  </span>
                  ข้อมูลผู้เสียหาย
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <Input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="นายสมชาย ใจดี"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    เลขบัตรประชาชน *
                  </label>
                  <Input
                    name="id_card"
                    value={formData.id_card}
                    onChange={handleChange}
                    placeholder="1234567890123"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">อายุ</label>
                  <Input
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="35"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">เพศ</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    วัน/เดือน/ปีเกิด
                  </label>
                  <Input
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    placeholder="1 มกราคม 2533"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0891234567"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ค่ายโทรศัพท์
                  </label>
                  <select
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">เลือกค่าย</option>
                    <option value="AIS">AIS</option>
                    <option value="TRUE">TRUE</option>
                    <option value="DTAC">DTAC</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: ที่อยู่ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    2
                  </span>
                  ที่อยู่
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ที่อยู่ตามบัตรประชาชน
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 ซอย... ถนน... แขวง... เขต... กรุงเทพฯ 10xxx"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ที่อยู่ปัจจุบัน
                  </label>
                  <textarea
                    name="current_address"
                    value={formData.current_address}
                    onChange={handleChange}
                    placeholder="(เหมือนที่อยู่บัตรประชาชน หรือระบุใหม่)"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: สถานีตำรวจ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    3
                  </span>
                  สถานีตำรวจที่สะดวก
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">จังหวัด</label>
                  <Input
                    name="police_province"
                    value={formData.police_province}
                    onChange={handleChange}
                    placeholder="กรุงเทพมหานคร"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ชื่อสถานี
                  </label>
                  <Input
                    name="station_name"
                    value={formData.station_name}
                    onChange={handleChange}
                    placeholder="คลองเตย"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 4: รายละเอียดเหตุการณ์ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    4
                  </span>
                  รายละเอียดเหตุการณ์ *
                </CardTitle>
                <CardDescription>
                  อธิบายเหตุการณ์ที่เกิดขึ้นให้ละเอียด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  name="incident_details"
                  value={formData.incident_details}
                  onChange={handleChange}
                  placeholder="เมื่อวันที่... ได้พบโฆษณา... จึงได้ติดต่อ... และโอนเงินไป... หลังจากนั้น..."
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </CardContent>
            </Card>

            {/* Section 5: ทรัพย์สินที่เสียหาย */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    5
                  </span>
                  ทรัพย์สินที่เสียหาย
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ประเภททรัพย์สิน
                  </label>
                  <Input
                    name="asset_type"
                    value={formData.asset_type}
                    onChange={handleChange}
                    placeholder="เงินสด"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    รายละเอียด
                  </label>
                  <Input
                    name="asset_details"
                    value={formData.asset_details}
                    onChange={handleChange}
                    placeholder="โอนเงินผ่านบัญชีธนาคาร"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    มูลค่า (บาท)
                  </label>
                  <Input
                    name="asset_value"
                    value={formData.asset_value}
                    onChange={handleChange}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    วันที่เกิดเหตุ
                  </label>
                  <Input
                    name="asset_date"
                    value={formData.asset_date}
                    onChange={handleChange}
                    placeholder="1 กุมภาพันธ์ 2569"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">เวลา</label>
                  <Input
                    name="asset_time"
                    value={formData.asset_time}
                    onChange={handleChange}
                    placeholder="14:30"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 6: ข้อมูลคนร้าย */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    6
                  </span>
                  ช่องทางติดต่อคนร้าย
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    เบอร์โทรคนร้าย
                  </label>
                  <Input
                    name="perpetrator_phone"
                    value={formData.perpetrator_phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    วัน/เวลาที่ติดต่อ
                  </label>
                  <Input
                    name="contact_datetime"
                    value={formData.contact_datetime}
                    onChange={handleChange}
                    placeholder="1 กุมภาพันธ์ 2569 14:00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ประเภท Social Media
                  </label>
                  <Input
                    name="social_media_type"
                    value={formData.social_media_type}
                    onChange={handleChange}
                    placeholder="Facebook, Line, Instagram"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Link / URL
                  </label>
                  <Input
                    name="social_media_url"
                    value={formData.social_media_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 7: ลายเซ็น */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    7
                  </span>
                  ลายเซ็น
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ชื่อผู้เสียหาย (ลายเซ็น)
                  </label>
                  <Input
                    name="victim_signature"
                    value={formData.victim_signature}
                    onChange={handleChange}
                    placeholder="นายสมชาย ใจดี"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    วันที่รายงาน
                  </label>
                  <Input
                    name="report_date"
                    value={formData.report_date}
                    onChange={handleChange}
                    placeholder="2 กุมภาพันธ์ 2569"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center py-4">
              <Button
                size="lg"
                onClick={handleGeneratePDF}
                disabled={
                  isGenerating ||
                  !formData.fullname ||
                  !formData.id_card ||
                  !formData.incident_details
                }
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังสร้าง PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    ดาวน์โหลด PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
