"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileWarning,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { createQuickReport, QuickReportData } from "@/lib/actions/fraud";

// Message type
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GREETING_MESSAGE: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: "สวัสดีครับ! 👋 ผมเป็น AI ผู้ช่วยของระบบ THEN\n\nผมพร้อมให้คำปรึกษาเรื่อง:\n• การถูกหลอกลวงออนไลน์\n• วิธีป้องกันตัวจากมิจฉาชีพ\n• ขั้นตอนการแจ้งความ\n• ตรวจสอบบัญชีที่น่าสงสัย\n\n💡 หากต้องการ **แจ้งข้อมูลมิจฉาชีพ** สามารถกดปุ่ม 'แจ้งเบาะแส' ด้านล่างได้เลยครับ\n\nมีอะไรให้ช่วยไหมครับ?",
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Report state
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickReportLoading, setQuickReportLoading] = useState(false);
  const [quickReportSuccess, setQuickReportSuccess] = useState<string | null>(null);
  const [quickReportForm, setQuickReportForm] = useState<QuickReportData>({
    reporterName: "",
    reporterPhone: "",
    incidentDetails: "",
    damageAmount: undefined,
    suspectAccountNumber: "",
    suspectBankName: "",
    suspectAccountName: "",
    suspectPhone: "",
    suspectSocialMedia: "",
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Submit message to AI
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // เรียก API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      // อ่าน streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: "",
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          
          // Update message with new content
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content = assistantContent;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  // Handle Quick Report submit
  const handleQuickReportSubmit = async () => {
    if (!quickReportForm.incidentDetails.trim()) return;

    setQuickReportLoading(true);
    try {
      const result = await createQuickReport(quickReportForm);
      if (result.success) {
        setQuickReportSuccess(result.caseNumber || null);
        setMessages((prev) => [
          ...prev,
          {
            id: `report_${Date.now()}`,
            role: "assistant",
            content: `✅ บันทึกเบาะแสเรียบร้อยแล้ว!\n\n📋 หมายเลขอ้างอิง: **${result.caseNumber}**\n\nขอบคุณที่ช่วยแจ้งข้อมูล ข้อมูลนี้จะช่วยเตือนผู้อื่นไม่ให้ตกเป็นเหยื่อครับ`,
          },
        ]);
        setTimeout(() => {
          setShowQuickReport(false);
          setQuickReportSuccess(null);
          setQuickReportForm({
            reporterName: "",
            reporterPhone: "",
            incidentDetails: "",
            damageAmount: undefined,
            suspectAccountNumber: "",
            suspectBankName: "",
            suspectAccountName: "",
            suspectPhone: "",
            suspectSocialMedia: "",
          });
        }, 2000);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error_${Date.now()}`,
            role: "assistant",
            content: `❌ ${result.message}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        },
      ]);
    } finally {
      setQuickReportLoading(false);
    }
  };

  const quickQuestions = [
    "โดนโกงซื้อของออนไลน์",
    "วิธีตรวจสอบบัญชีมิจฉาชีพ",
    "ขั้นตอนการแจ้งความ",
    "มีโอกาสได้เงินคืนไหม",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-6 md:py-8 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI ให้คำปรึกษา
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            ถามตอบกับ AI
          </h1>
          <p className="text-sm text-muted-foreground">
            สอบถามข้อมูลเกี่ยวกับการหลอกลวงออนไลน์ได้โดยไม่ต้องเข้าสู่ระบบ
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">
                ลองถามเรื่องเหล่านี้:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Report Button */}
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950"
                onClick={() => setShowQuickReport(true)}
              >
                <FileWarning className="h-4 w-4 mr-2" />
                แจ้งเบาะแสมิจฉาชีพ
              </Button>
            </div>
          </div>
        </Card>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 กดปุ่ม &ldquo;แจ้งเบาะแส&rdquo; เพื่อบันทึกข้อมูลมิจฉาชีพ
          ไม่ต้องเข้าสู่ระบบ
        </p>
      </div>

      {/* Quick Report Modal */}
      {showQuickReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setShowQuickReport(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-lg">แจ้งเบาะแสมิจฉาชีพ</CardTitle>
              </div>
              <CardDescription>
                แจ้งข้อมูลมิจฉาชีพที่พบเจอ เพื่อช่วยเตือนคนอื่นๆ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickReportSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    บันทึกเรียบร้อยแล้ว!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    หมายเลขอ้างอิง:{" "}
                    <span className="font-mono font-bold">
                      {quickReportSuccess}
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  {/* เรื่องราว (บังคับ) */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      เล่าเหตุการณ์ที่เกิดขึ้น{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="เช่น: โอนเงินซื้อของแล้วไม่ได้รับสินค้า, ถูกหลอกให้โอนเงิน..."
                      value={quickReportForm.incidentDetails}
                      onChange={(e) =>
                        setQuickReportForm({
                          ...quickReportForm,
                          incidentDetails: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* ข้อมูลบัญชีผู้ต้องสงสัย */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ข้อมูลบัญชีมิจฉาชีพ (ถ้ามี)
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          เลขบัญชี
                        </label>
                        <Input
                          placeholder="xxx-x-xxxxx-x"
                          value={quickReportForm.suspectAccountNumber}
                          onChange={(e) =>
                            setQuickReportForm({
                              ...quickReportForm,
                              suspectAccountNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          ธนาคาร
                        </label>
                        <Input
                          placeholder="กสิกรไทย"
                          value={quickReportForm.suspectBankName}
                          onChange={(e) =>
                            setQuickReportForm({
                              ...quickReportForm,
                              suspectBankName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          ชื่อบัญชี
                        </label>
                        <Input
                          placeholder="นาย..."
                          value={quickReportForm.suspectAccountName}
                          onChange={(e) =>
                            setQuickReportForm({
                              ...quickReportForm,
                              suspectAccountName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          จำนวนเงินที่เสียไป (บาท)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={quickReportForm.damageAmount || ""}
                          onChange={(e) =>
                            setQuickReportForm({
                              ...quickReportForm,
                              damageAmount: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        ช่องทางติดต่อมิจฉาชีพ (Facebook, Line, เบอร์โทร)
                      </label>
                      <Input
                        placeholder="เช่น fb.com/xxx, Line: @xxx"
                        value={quickReportForm.suspectSocialMedia}
                        onChange={(e) =>
                          setQuickReportForm({
                            ...quickReportForm,
                            suspectSocialMedia: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* ข้อมูลผู้แจ้ง (ไม่บังคับ) */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      ข้อมูลผู้แจ้ง (ไม่บังคับ)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="ชื่อ-นามสกุล"
                        value={quickReportForm.reporterName}
                        onChange={(e) =>
                          setQuickReportForm({
                            ...quickReportForm,
                            reporterName: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="เบอร์โทร"
                        value={quickReportForm.reporterPhone}
                        onChange={(e) =>
                          setQuickReportForm({
                            ...quickReportForm,
                            reporterPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleQuickReportSubmit}
                    disabled={
                      !quickReportForm.incidentDetails.trim() ||
                      quickReportLoading
                    }
                  >
                    {quickReportLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <FileWarning className="h-4 w-4 mr-2" />
                        บันทึกเบาะแส
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    ข้อมูลจะถูกบันทึกเพื่อช่วยเตือนผู้อื่น
                    และอาจใช้ในการสืบสวนต่อไป
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </main>
  );
}
