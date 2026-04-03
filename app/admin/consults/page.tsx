"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Search, Calendar, ChevronRight, ArrowLeft, Send } from "lucide-react";

interface ConsultationData {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: {
    phone: string;
    email: string | null;
  };
  responses: {
    id: string;
    message: string;
    createdAt: string;
    responder?: {
      name: string;
      role: string;
    };
  }[];
}

export default function AdminConsultsPage() {
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูลทั้งหมด
  const fetchConsultations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/consultations");
      const data = await res.json();
      
      if (data.ok) {
        setConsultations(data.consultations);
      } else {
        console.error("Failed to fetch consultations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ดึงข้อมูลรายเคสเมื่อกดดูรายละเอียด
    const fetchConsultationDetail = async (id: string) => {
      try {
        // สำหรับความรวดเร็ว หาจาก state ก่อนถ้ามี responses ครบ
        const cached = consultations.find((c) => c.id === id);
        if (
          cached &&
          cached.responses &&
          cached.responses.length > 0 &&
          typeof cached.responses[0].message === "string" &&
          !!cached.responses[0].createdAt
        ) {
          return;
        }

        setIsLoading(true);
        const res = await fetch("/api/admin/consultations");
        const data = await res.json();
        if (data.ok) {
          setConsultations(data.consultations);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCaseId) {
      fetchConsultationDetail(selectedCaseId);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    fetchConsultations();
  }, []);

  // ส่งคำตอบ
  const handleReply = async () => {
    if (!selectedCaseId || !replyMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/consultations/${selectedCaseId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setReplyMessage("");
        await fetchConsultations(); // โหลดข้อมูลใหม่เพื่ออัปเดต status
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถส่งคำตอบได้"));
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = consultations.filter((item) => {
    // 1. Status Filter
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    
    // 2. Search Query (phone or subject)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSubject = item.subject.toLowerCase().includes(query);
      const matchPhone = item.user.phone.includes(query);
      return matchSubject || matchPhone;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">รอตอบ</Badge>;
      case "answered":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">ตอบแล้ว</Badge>;
      case "closed":
        return <Badge variant="outline">ปิดเคส</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (selectedCaseId) {
    const detail = consultations.find(c => c.id === selectedCaseId);
    if (!detail) return null;

    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedCaseId(null)}
          className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> แบ็คกลับไปหน้ารวม
        </Button>

        <Card>
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(detail.status)}
                  <span className="text-sm text-muted-foreground">
                    รหัสอ้างอิง: {detail.id}
                  </span>
                </div>
                <CardTitle className="text-xl">{detail.subject}</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground sm:text-right">
                <p>ผู้ติดต่อ: <span className="text-foreground font-medium">{detail.user.phone}</span></p>
                <p className="flex items-center sm:justify-end gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(detail.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {/* คำถามจาก User */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                U
              </div>
              <div className="flex-1 bg-muted/30 p-4 rounded-xl rounded-tl-sm border border-border/50">
                <p className="text-sm font-semibold mb-2">ผู้ใช้งาน</p>
                <p className="text-sm whitespace-pre-wrap">{detail.message}</p>
              </div>
            </div>

            {/* คำตอบจาก Admin (ถ้ามี) */}
            {detail.responses && detail.responses.length > 0 && detail.responses.map(response => (
              <div key={response.id} className="flex gap-4 flex-row-reverse">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  A
                </div>
                <div className="flex-1 bg-primary/5 p-4 rounded-xl rounded-tr-sm border border-primary/20 text-right">
                  <p className="text-sm font-semibold text-primary mb-2">
                    {response.responder?.name || "เจ้าหน้าที่"}
                  </p>
                  <p className="text-sm text-foreground text-left whitespace-pre-wrap">
                    {response.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(response.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* กล่องพิมพ์ตอบกลับ */}
            <div className="pt-6 border-t border-border mt-8">
              <label className="text-sm font-medium mb-2 block">ส่งคำตอบให้ผู้ใช้งาน</label>
              <Textarea 
                placeholder="พิมพ์ข้อความตอบกลับที่นี่..."
                className="min-h-[120px] resize-none mb-4"
                value={replyMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setReplyMessage("")}
                  disabled={isSubmitting || !replyMessage.trim()}
                >
                  ล้างข้อความ
                </Button>
                <Button 
                  onClick={handleReply} 
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  ส่งข้อความ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ปรึกษาปัญหา</h1>
          <p className="text-muted-foreground">จัดการและตอบคำถามจากผู้ใช้งาน</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            ทั้งหมด
          </Button>
          <Button 
            variant={statusFilter === "open" ? "default" : "outline"} 
            onClick={() => setStatusFilter("open")}
            size="sm"
          >
            รอตอบ
          </Button>
          <Button 
            variant={statusFilter === "answered" ? "default" : "outline"} 
            onClick={() => setStatusFilter("answered")}
            size="sm"
          >
            ตอบแล้ว
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              รายการคำปรึกษา
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา หัวข้อ หรือ เบอร์โทร..."
                className="pl-8 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p>ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredData.map((consult) => (
                <div 
                  key={consult.id} 
                  onClick={() => setSelectedCaseId(consult.id)}
                  className="p-4 sm:px-6 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(consult.status)}
                      <span className="text-sm font-medium text-muted-foreground">
                        เบอร์: {consult.user.phone}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {consult.subject}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {consult.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(consult.createdAt)}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
