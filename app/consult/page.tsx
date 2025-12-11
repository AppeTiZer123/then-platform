"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { mockConsultations } from "@/lib/mock-data";

export default function ConsultPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setSubject("");
    setMessage("");
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            ปรึกษาเจ้าหน้าที่
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            สอบถามข้อมูลหรือขอคำปรึกษาเกี่ยวกับการดำเนินคดีอาชญากรรมออนไลน์
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ช่องทางติดต่อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">LINE Official</p>
                    <p className="text-xs text-muted-foreground">@then-official</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">สายด่วน</p>
                    <p className="text-xs text-muted-foreground">1441</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">อีเมล</p>
                    <p className="text-xs text-muted-foreground">contact@then.go.th</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LINE Bot Notice */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 dark:text-green-300">LINE Bot</p>
                    <p className="text-green-700 dark:text-green-400 mt-1">
                      เร็วๆ นี้! จะสามารถปรึกษาผ่าน LINE Bot ได้โดยตรง พร้อมระบบ AI ช่วยตอบคำถาม 24 ชม.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  ส่งคำถาม
                </CardTitle>
                <CardDescription>
                  กรอกข้อมูลด้านล่างเพื่อส่งคำถามถึงเจ้าหน้าที่
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">ส่งคำถามสำเร็จ!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      เจ้าหน้าที่จะตอบกลับภายใน 24 ชั่วโมง
                    </p>
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                      ส่งคำถามใหม่
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">หัวข้อ *</label>
                      <Input 
                        placeholder="สอบถามเรื่อง..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">ข้อความ *</label>
                      <textarea 
                        className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="รายละเอียดคำถาม..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || !subject.trim() || !message.trim()}
                    >
                      {isSubmitting ? (
                        "กำลังส่ง..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ส่งคำถาม
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Previous Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ตัวอย่างคำถามที่ถามบ่อย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockConsultations.map((consultation) => (
                  <div key={consultation.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{consultation.subject}</h4>
                      <Badge variant={consultation.status === "answered" ? "default" : "secondary"}>
                        {consultation.status === "answered" ? "ตอบแล้ว" : "รอตอบ"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{consultation.message}</p>
                    
                    {consultation.responses.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">{consultation.responses[0].responderName}</span>
                        </div>
                        <p className="text-sm">{consultation.responses[0].message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
