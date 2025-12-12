"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, MapPin, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { updateUserProfile } from "@/lib/actions/user";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    idCard: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ถ้ายังไม่ login ให้ไปหน้า login (จริงๆ middleware จะ handle แล้ว)
  if (!session?.user) {
    return null;
  }

  // ถ้ามี name แล้ว (profile ครบแล้ว) ให้ redirect หลัง render
  useEffect(() => {
    if (session.user.name) {
      router.push("/");
    }
  }, [session?.user?.name, router]);

  if (session.user.name) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await updateUserProfile(session.user.id, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        idCardEncrypted: formData.idCard.trim() || undefined,
        address: formData.address.trim() || undefined,
      });
      
      // Update session - trigger jwt callback เพื่อดึงข้อมูลใหม่จาก DB
      await update({ refresh: true });
      
      // Redirect ไปหน้าที่ต้องการ
      router.push("/report");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">ยืนยันตัวตนสำเร็จ!</CardTitle>
            <CardDescription>
              กรุณากรอกข้อมูลเพิ่มเติมเพื่อใช้งานระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ชื่อ-นามสกุล (required) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ชื่อ-นามสกุล <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="นายสมชาย ใจดี"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* อีเมล (optional) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  อีเมล <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* เลขบัตรประชาชน (optional) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  เลขบัตรประชาชน <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="1-xxxx-xxxxx-xx-x"
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    className="pl-10"
                    maxLength={17}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ข้อมูลจะถูกเข้ารหัสเพื่อความปลอดภัย
                </p>
              </div>

              {/* ที่อยู่ (optional) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ที่อยู่ <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full min-h-[80px] pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !formData.name.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึกข้อมูล"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}
