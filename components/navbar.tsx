"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Shield, FileText, MessageCircle, Settings, Bot, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const publicLinks = [
  { href: "/", label: "หน้าแรก", icon: Shield },
  { href: "/report", label: "แจ้งความ", icon: FileText },
  { href: "/ai-chat", label: "AI ปรึกษา", icon: Bot },
  { href: "/consult", label: "ติดต่อเจ้าหน้าที่", icon: MessageCircle },
];

const adminLink = { href: "/admin", label: "Admin", icon: Settings };

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isAuthenticated = !!session?.user;
  const user = session?.user;
  
  // แสดง Admin link เฉพาะ role admin
  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin ? [...publicLinks, adminLink] : publicLinks;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">THEN</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">{user?.name || user?.phone}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/report">เล่าเรื่อง</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">เปิดเมนู</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-border mt-4 pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm text-muted-foreground px-3">{user?.name || user?.phone}</p>
                    <Button variant="outline" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      เข้าสู่ระบบ
                    </Link>
                  </Button>
                )}
                <Button asChild className="w-full">
                  <Link href="/report" onClick={() => setIsOpen(false)}>
                    เล่าเรื่อง ให้ AI สร้างเอกสาร
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
