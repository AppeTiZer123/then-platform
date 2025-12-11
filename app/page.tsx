import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FraudCheck } from "@/components/fraud-check";
import { Footer } from "@/components/footer";
import { FileText, MessageCircle, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "เล่าเรื่อง สร้างเอกสาร",
    description: "แค่เล่าเหตุการณ์ที่เกิดขึ้น AI ช่วยวิเคราะห์และสร้างเอกสารใบแจ้งความให้อัตโนมัติ",
  },
  {
    icon: ShieldCheck,
    title: "ตรวจสอบมิจฉาชีพ",
    description: "ค้นหาเลขบัญชีหรือเบอร์โทรศัพท์ เพื่อตรวจสอบประวัติการหลอกลวง",
  },
  {
    icon: MessageCircle,
    title: "ปรึกษาเจ้าหน้าที่",
    description: "สอบถามข้อมูลและรับคำแนะนำจากเจ้าหน้าที่ผู้เชี่ยวชาญ",
  },
  {
    icon: Clock,
    title: "ติดตามสถานะ",
    description: "ตรวจสอบความคืบหน้าของคดีได้ตลอดเวลาผ่านระบบออนไลน์",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              บริการของเรา
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ระบบครบวงจรสำหรับการรับมือกับปัญหาอาชญากรรมทางออนไลน์
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Fraud Check Section */}
      <div id="fraud-check">
        <FraudCheck />
      </div>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ตกเป็นเหยื่อการหลอกลวง?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            ไม่ต้องกรอกฟอร์มยุ่งยาก! แค่เล่าเรื่องราวที่เกิดขึ้น AI จะช่วยสร้างเอกสารให้
            เพิ่มโอกาสในการติดตามเงินคืน และช่วยป้องกันไม่ให้ผู้อื่นตกเป็นเหยื่อ
          </p>
          <a
            href="/report"
            className="inline-flex items-center justify-center rounded-lg bg-white text-primary px-8 py-3 text-base font-semibold hover:bg-white/90 transition-colors"
          >
            <FileText className="mr-2 h-5 w-5" />
            เล่าเรื่อง ให้ AI สร้างเอกสาร
          </a>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
