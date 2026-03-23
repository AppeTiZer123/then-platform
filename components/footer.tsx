import { Shield, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8" />
              <span className="text-xl font-bold">THEN</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md">
              ระบบรับแจ้งความและปรึกษาออนไลน์ สำหรับประชาชนที่ตกเป็นเหยื่อ
              การหลอกลวงทางออนไลน์ พร้อมให้บริการตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/report"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  แจ้งความออนไลน์
                </Link>
              </li>
              <li>
                <Link
                  href="/report/track"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  ติดตามสถานะคดี
                </Link>
              </li>
              <li>
                <Link
                  href="/#fraud-check"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  ตรวจสอบมิจฉาชีพ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <a
                  href="tel:0979966908"
                  className="hover:text-primary-foreground transition-colors"
                >
                  097-996-6908
                </a>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:contact@meyameya.me"
                  className="hover:text-primary-foreground transition-colors"
                >
                  contact@meyameya.me
                </a>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  บริษัท มียามียา จำกัด
                  <br />
                  233/77 Sanphawut Rd, South Bangna,
                  <br />
                  Bangna, Bangkok, Thailand 10260
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>
            © {new Date().getFullYear()} THEN - ระบบรับแจ้งความและปรึกษาออนไลน์.
            สงวนลิขสิทธิ์.
          </p>
          <p className="mt-1">พัฒนาเป็นโปรเจกต์จบการศึกษา</p>
        </div>
      </div>
    </footer>
  );
}
