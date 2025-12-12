import { Shield, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">ระบบรับแจ้งความออนไลน์</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            เล่าเรื่องของคุณ
            <br />
            <span className="text-sky-300">AI สร้างเอกสารให้</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            แค่เล่าเหตุการณ์ที่ถูกหลอกลวง AI จะช่วยวิเคราะห์และสร้างเอกสารใบแจ้งความให้อัตโนมัติ
            พร้อมตรวจสอบบัญชีมิจฉาชีพ และปรึกษาเจ้าหน้าที่ได้ตลอด 24 ชั่วโมง
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/report">
                <FileText className="mr-2 h-5 w-5" />
                เล่าเรื่อง ให้ AI สร้างเอกสาร
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/consult">
                <MessageCircle className="mr-2 h-5 w-5" />
                ปรึกษาเจ้าหน้าที่
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">15,000+</div>
              <div className="text-sm text-white/70">คดีที่ดำเนินการ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">234</div>
              <div className="text-sm text-white/70">บัญชีมิจฉาชีพ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">98%</div>
              <div className="text-sm text-white/70">ความพึงพอใจ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/70">พร้อมให้บริการ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
