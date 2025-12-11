"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, KeyRound, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOTP, pendingPhone, isAuthenticated } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/report");
    return null;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    const success = await login(phone);
    if (success) {
      setStep("otp");
    } else {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    setIsLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    const success = await verifyOTP(otp);
    if (success) {
      router.push("/report");
    } else {
      setError("รหัส OTP ไม่ถูกต้อง");
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP" 
                : `กรอกรหัส OTP ที่ส่งไปยัง ${pendingPhone}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="081-234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading || !phone.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่ง OTP...
                    </>
                  ) : (
                    "ขอรหัส OTP"
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Mock OTP: <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">รหัส OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 text-center text-2xl tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    "ยืนยัน"
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  เปลี่ยนเบอร์โทร
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}
