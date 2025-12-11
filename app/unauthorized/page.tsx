import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground mb-6">
            หน้านี้สำหรับเจ้าหน้าที่และผู้ดูแลระบบเท่านั้น 
            หากคุณเชื่อว่าเกิดข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/">กลับหน้าหลัก</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-chat">ปรึกษา AI</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
