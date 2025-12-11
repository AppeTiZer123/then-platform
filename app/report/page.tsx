"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Lock
} from "lucide-react";

export default function ReportPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user;
  
  const [step, setStep] = useState<"contact" | "story" | "processing" | "complete">("contact");
  const [contactInfo, setContactInfo] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    email: ""
  }));
  const [story, setStory] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

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
                <Link href="/login">
                  เข้าสู่ระบบ
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                หรือลองใช้ <Link href="/ai-chat" className="text-primary underline">AI ให้คำปรึกษา</Link> โดยไม่ต้องเข้าสู่ระบบ
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
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setReferenceNumber(`RPT-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`);
    setStep("complete");
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
                <span className="text-sm font-medium text-primary">AI ช่วยสร้างเอกสาร</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                เล่าเรื่องราวของคุณ
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                แค่เล่าเหตุการณ์ที่เกิดขึ้น AI จะช่วยวิเคราะห์และสร้างเอกสารใบแจ้งความให้คุณอัตโนมัติ
              </p>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <p className="text-xs text-muted-foreground">กรอกข้อมูลติดต่อ</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <p className="text-xs text-muted-foreground">เล่าเรื่องราว</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
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
                    <label className="text-sm font-medium mb-1.5 block">ชื่อ-นามสกุล *</label>
                    <Input 
                      placeholder="นายสมชาย ใจดี"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">เบอร์โทรศัพท์ *</label>
                    <Input 
                      placeholder="081-234-5678"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">อีเมล (ไม่บังคับ)</label>
                    <Input 
                      type="email"
                      placeholder="email@example.com"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    ถัดไป
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                เล่าให้ละเอียดที่สุดเท่าที่จะทำได้ AI จะช่วยสรุปและสร้างเอกสารให้
              </p>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400">ข้อมูลติดต่อ</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <p className="text-xs text-primary font-medium">เล่าเรื่องราว</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
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
                  อธิบายเหตุการณ์ที่เกิดขึ้น เช่น ถูกหลอกอย่างไร ผ่านช่องทางไหน เสียเงินไปเท่าไหร่
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
                        <li>• ระบุช่องทางการติดต่อ (Facebook, Line, เบอร์โทร)</li>
                        <li>• หมายเลขบัญชีที่โอนเงินไป</li>
                        <li>• ลำดับเหตุการณ์ที่เกิดขึ้น</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upload Evidence */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">แนบรูปหลักฐาน (ไม่บังคับ)</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    ภาพหน้าจอการสนทนา, หลักฐานการโอนเงิน
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    เลือกไฟล์
                  </Button>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("contact")} className="flex-1">
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
              <h2 className="text-xl font-bold mb-2">AI กำลังวิเคราะห์เรื่องราว...</h2>
              <p className="text-muted-foreground text-sm">
                กำลังประมวลผลและสร้างเอกสารใบแจ้งความให้คุณ
              </p>
              <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>วิเคราะห์ข้อมูลจากเรื่องเล่า</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>สร้างสำนวนคดี</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground opacity-50">
                  <div className="h-4 w-4" />
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
              <p className="text-xl font-bold text-primary">{referenceNumber}</p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">ขั้นตอนถัดไป:</p>
                  <p className="text-muted-foreground">
                    เจ้าหน้าที่จะตรวจสอบข้อมูลและอาจติดต่อกลับเพื่อขอข้อมูลเพิ่มเติม
                    คุณสามารถดาวน์โหลดเอกสารหรือติดตามสถานะได้
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/report/track">ติดตามสถานะ</Link>
              </Button>
              <Button className="flex-1" asChild>
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
