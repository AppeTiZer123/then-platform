"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  User,
  Clock,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  fromAdmin?: boolean;
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  userName: string;
  userId: string;
  lastMessage: string;
  unread: number;
  messages: Message[];
};

const mockConversations: Conversation[] = [
  {
    id: "c1",
    userName: "คุณสมชาย",
    userId: "u1001",
    lastMessage: "ขอคำแนะนำเรื่องการแจ้งความ",
    unread: 1,
    messages: [
      { id: "m1", fromAdmin: false, text: "สวัสดีครับ ต้องการความช่วยเหลือเรื่องใดครับ", time: "10:02" },
      { id: "m2", fromAdmin: true, text: "สวัสดีครับ เราช่วยได้ครับ แจ้งรายละเอียดมาก่อนครับ", time: "10:04" },
      { id: "m3", fromAdmin: false, text: "ผมถูกโกงเงินออนไลน์", time: "10:06" },
    ],
  },
  {
    id: "c2",
    userName: "น.ส.มาลี",
    userId: "u1002",
    lastMessage: "ขอบคุณค่ะ",
    unread: 0,
    messages: [
      { id: "m1", fromAdmin: false, text: "ขอบคุณสำหรับคำแนะนำค่ะ", time: "09:10" },
      { id: "m2", fromAdmin: true, text: "ยินดีครับ ถ้ามีข้อสงสัยเพิ่มเติมแจ้งได้เลย", time: "09:12" },
    ],
  },
];

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string>(conversations[0].id);
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => conversations.find((c) => c.id === selectedId)!, [conversations, selectedId]);

  function sendReply() {
    if (!reply.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      fromAdmin: true,
      text: reply.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, unread: 0 } : c
      )
    );
    setReply("");
  }

  // scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [selected, conversations]);

  const filtered = conversations.filter((c) => c.userName.toLowerCase().includes(query.toLowerCase()) || c.lastMessage.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-full max-w-7xl mx-auto flex gap-6 p-6">
        {/* Left: Conversations */}
        <aside className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-sidebar-border flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-card-foreground">แชทกับผู้ใช้</h2>
          </div>
          <div className="px-3 py-2 border-b border-sidebar-border">
            <Input
              placeholder="ค้นหาชื่อหรือข้อความล่าสุด..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="p-2 flex-1 overflow-auto">
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground px-3 py-6 text-center">ไม่พบการสนทนา</div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors border-l-4 ${
                    c.id === selectedId
                      ? "border-l-primary bg-primary/5 text-card-foreground"
                      : "border-l-transparent hover:bg-muted/10 text-muted-foreground"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">{c.userName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium truncate text-card-foreground">{c.userName}</div>
                      <div className="text-xs text-muted-foreground">{c.messages[c.messages.length - 1].time}</div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && (
                    <div className="ml-2 bg-destructive text-white text-xs px-2 py-0.5 rounded-full">{c.unread}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Messages */}
        <section className="flex-1 flex flex-col">
          <Card className="h-full flex-1 flex flex-col">
            <CardHeader className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-1 rounded hover:bg-accent">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">{selected.userName[0]}</div>
                  <div>
                    <div className="text-sm font-medium">{selected.userName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" /> นักสนทนา: {selected.userId}</div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-auto space-y-4 bg-muted/3">
              <div ref={messagesRef} className="space-y-4">
                {selected.messages.map((m) => (
                  <div key={m.id} className={`max-w-[75%] ${m.fromAdmin ? "ml-auto" : ""}`}> 
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${m.fromAdmin ? "bg-primary text-primary-foreground" : "bg-white text-card-foreground border"}`}>
                      <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="px-4 py-3 border-t border-border bg-background sticky bottom-0">
              <div className="flex gap-2 w-full items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  rows={2}
                  aria-label="ข้อความตอบกลับ"
                  placeholder="พิมพ์ข้อความตอบกลับผู้ใช้... (Enter เพื่อส่ง, Shift+Enter ลงบรรทัดใหม่)"
                  className="flex-1 resize-none rounded-md border px-3 py-2 bg-transparent"
                />
                <Button onClick={sendReply} size="sm">
                  <Send className="h-4 w-4" /> ส่ง
                </Button>
              </div>
              
            </CardFooter>
          </Card>
        </section>


      </div>
    </div>
  );
}
