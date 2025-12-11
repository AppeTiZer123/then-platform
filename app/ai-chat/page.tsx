"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User,
  Sparkles
} from "lucide-react";
import { ChatMessage, getAIResponse, createMessage } from "@/lib/ai-service";

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initial greeting
  useEffect(() => {
    const greeting = createMessage(
      "assistant",
      "สวัสดีครับ! 👋 ผมเป็น AI ผู้ช่วยของระบบ THEN\n\nผมพร้อมให้คำปรึกษาเรื่อง:\n• การถูกหลอกลวงออนไลน์\n• วิธีป้องกันตัวจากมิจฉาชีพ\n• ขั้นตอนการแจ้งความ\n• ตรวจสอบบัญชีที่น่าสงสัย\n\nมีอะไรให้ช่วยไหมครับ?"
    );
    setMessages([greeting]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = createMessage("user", input.trim());
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getAIResponse(input.trim());
      const assistantMessage = createMessage("assistant", response);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage = createMessage(
        "assistant",
        "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
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
            <span className="text-sm font-medium text-primary">AI ให้คำปรึกษา</span>
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">ลองถามเรื่องเหล่านี้:</p>
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
          </div>
        </Card>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          * นี่เป็น AI จำลอง หากต้องการความช่วยเหลือจริง กรุณาใช้ระบบแจ้งความ
        </p>
      </div>
      
      <Footer />
    </main>
  );
}
