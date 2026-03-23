"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  MessageCircle,
  Settings,
  Menu,
  Shield,
  LogOut,
  Key,
  Loader2,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reports", label: "รายการแจ้งความ", icon: FileText },
  { href: "/admin/fraud-list", label: "บัญชีมิจฉาชีพ", icon: AlertTriangle },
  { href: "/admin/consults", label: "ปรึกษาปัญหา", icon: MessageCircle },
  { href: "/admin/settings", label: "ตั้งค่า", icon: Settings },
  { href: "/", label: "กลับหน้าแรก", icon: Home },
];

// Move SidebarContent outside the component to avoid re-creating on each render
function SidebarContent({
  pathname,
  userName,
  onLinkClick,
  onLogout,
}: {
  pathname: string;
  userName: string;
  onLinkClick?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <Shield className="h-8 w-8 text-sidebar-primary" />
        <div>
          <span className="text-lg font-bold text-sidebar-foreground">
            THEN
          </span>
          <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 mb-2">
          {userName || "Admin"}
        </p>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const user = session?.user;

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handleDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - middleware จะ handle แต่ใส่ไว้เผื่อ
  if (!session) {
    return null;
  }

  // Middleware จะ handle role check แล้ว แต่ใส่ fallback ไว้
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <SidebarContent
          pathname={pathname}
          userName={user?.name || user?.phone || "Admin"}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-sidebar border-sidebar-border"
        >
          <SidebarContent
            pathname={pathname}
            userName={user?.name || user?.phone || "Admin"}
            onLinkClick={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">
              {sidebarLinks.find((l) => l.href === pathname)?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name || user?.phone}
            </span>

            <div className="relative">
              <button
                ref={buttonRef}
                aria-label="Account menu"
                onClick={() => setMenuOpen((s) => !s)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <span className="sr-only">Open user menu</span>
                <span className="text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </span>
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-64 bg-popover rounded-lg shadow-lg ring-1 ring-black/5 z-50"
                >
                  <div className="p-3 border-b border-muted-foreground/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {user?.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          Hi! {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Login time :{" "}
                          {new Date().toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-muted/50"
                    >
                      <Home className="w-4 h-4" />
                      กลับหน้าแรก
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-muted/50"
                    >
                      <Settings className="w-4 h-4" />
                      ตั้งค่า
                    </Link>

                    <div className="pt-2 border-t border-muted-foreground/10 px-3">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded bg-destructive/10 text-sm text-destructive hover:brightness-95"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
