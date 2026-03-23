import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { FloatingConsultWidget } from "@/components/floating-consult-widget";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบรับแจ้งความและปรึกษาออนไลน์ | THEN",
  description:
    "ระบบรับแจ้งเรื่องการถูกหลอกลวงออนไลน์ ตรวจสอบบัญชีมิจฉาชีพ และปรึกษาเจ้าหน้าที่",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          {children}
          <FloatingConsultWidget />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
