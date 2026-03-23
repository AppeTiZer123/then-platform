"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FloatingConsultWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isHiddenRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/unauthorized");

  if (isHiddenRoute) {
    return null;
  }

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          setOpen(false);
          router.push(
            `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`,
          );
          return;
        }

        throw new Error(data?.error || "ไม่สามารถส่งคำปรึกษาได้");
      }

      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="fixed right-4 bottom-4 z-50 h-12 rounded-full px-4 shadow-lg sm:right-6 sm:bottom-6"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-4 w-4" />
        ปรึกษาเจ้าหน้าที่
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ปรึกษาเจ้าหน้าที่</DialogTitle>
            <DialogDescription>
              ส่งคำถามได้ทันที เจ้าหน้าที่จะตอบกลับผ่านระบบโดยเร็วที่สุด
            </DialogDescription>
          </DialogHeader>

          {status === "loading" ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !session ? (
            <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2 text-amber-900">
                <ShieldAlert className="mt-0.5 h-4 w-4" />
                <p className="text-sm">
                  กรุณาเข้าสู่ระบบก่อนส่งคำปรึกษา
                  เพื่อให้เจ้าหน้าที่ตอบกลับถึงบัญชีของคุณได้ถูกต้อง
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  ปิด
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`,
                    )
                  }
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4 rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-900">
                ส่งคำปรึกษาสำเร็จแล้ว เจ้าหน้าที่จะตอบกลับในหน้า{" "}
                <Link href="/consult" className="underline">
                  ปรึกษาเจ้าหน้าที่
                </Link>
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  ปิด
                </Button>
                <Button asChild>
                  <Link href="/consult" onClick={() => setOpen(false)}>
                    ไปหน้าประวัติคำปรึกษา
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">หัวข้อ</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="ต้องการปรึกษาเรื่องอะไร"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">รายละเอียด</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="พิมพ์รายละเอียดปัญหาที่ต้องการสอบถาม"
                  className="min-h-[140px]"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <DialogFooter className="sm:justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/consult" onClick={() => setOpen(false)}>
                    ดูประวัติคำปรึกษา →
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        กำลังส่ง...
                      </>
                    ) : (
                      "ส่งคำปรึกษา"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
