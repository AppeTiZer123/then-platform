"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock3,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Update Consultation type interface based on our API response
interface ConsultationData {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  responses: {
    id: string;
    message: string;
    createdAt: string;
    responder: {
      name: string;
      role: string;
    };
  }[];
}

export default function ConsultPage() {
  const { data: session } = useSession();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!session?.user?.id) {
        setListError(null);
        setIsLoadingList(false);
        return;
      }

      try {
        setListError(null);
        const res = await fetch("/api/consultations");
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "ไม่สามารถโหลดประวัติคำปรึกษาได้");
        }

        if (mounted) {
          setConsultations(data.consultations);
        }
      } catch (err) {
        console.error("Failed to fetch consultations:", err);
        if (mounted) {
          setListError("ไม่สามารถโหลดประวัติคำปรึกษาได้ กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        if (mounted) {
          setIsLoadingList(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [session]);

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
                    <p className="text-xs text-muted-foreground">
                      @then-official
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      contact@then.go.th
                    </p>
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
                    <p className="font-medium text-green-800 dark:text-green-300">
                      LINE Bot
                    </p>
                    <p className="text-green-700 dark:text-green-400 mt-1">
                      เร็วๆ นี้! จะสามารถปรึกษาผ่าน LINE Bot ได้โดยตรง พร้อมระบบ
                      AI ช่วยตอบคำถาม 24 ชม.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultation Form & List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ประวัติคำปรึกษาเจ้าหน้าที่
                </CardTitle>
                <CardDescription>
                  หน้านี้ใช้สำหรับติดตามสถานะและคำตอบจากเจ้าหน้าที่
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!session ? (
                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-4">
                      กรุณาเข้าสู่ระบบเพื่อดูประวัติคำปรึกษาของคุณ
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/login?callbackUrl=%2Fconsult">
                        เข้าสู่ระบบ
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                    การส่งคำปรึกษาใหม่สามารถทำได้ผ่านปุ่มลอยมุมขวาล่างของหน้าจอ
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Consultations */}
            {session && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    ประวัติการขอคำปรึกษาของคุณ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingList ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : listError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {listError}
                    </div>
                  ) : consultations.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-6">
                      ยังไม่มีประวัติการส่งคำถาม
                    </p>
                  ) : (
                    consultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-medium text-sm">
                              {consultation.subject}
                            </h4>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatDateTime.format(
                                new Date(consultation.createdAt),
                              )}
                            </p>
                          </div>
                          <Badge
                            variant={
                              consultation.status === "answered"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {consultation.status === "answered"
                              ? "ตอบแล้ว"
                              : "รอตอบ"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {consultation.message}
                        </p>

                        {consultation.responses &&
                          consultation.responses.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {consultation.responses.map((response) => (
                                <div
                                  key={response.id}
                                  className="bg-muted/50 rounded-lg p-3"
                                >
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      <span className="text-xs font-medium">
                                        {response.responder?.name ||
                                          "เจ้าหน้าที่"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime.format(
                                        new Date(response.createdAt),
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-sm">{response.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
