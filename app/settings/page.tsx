"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserManagement from "./components/UserManagement";
import OfficerManagement from "./components/OfficerManagement";
import DataManagement from "./components/DataManagement";

const SECTIONS = [
  { key: "users", label: "การจัดการผู้ใช้" },
  { key: "data", label: "การจัดการข้อมูล" },
];

const USER_TABS = [
  { key: "admin", label: "Admin" },
  { key: "user", label: "User" },
  { key: "officer", label: "Officer" },
] as const;

type UserTab = (typeof USER_TABS)[number]["key"];

export default function SettingsPage() {
  const [active, setActive] = useState<string>("users");
  const [userTab, setUserTab] = useState<UserTab>("admin");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Admin Settings</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>เมนูตั้งค่า</CardTitle>
              <CardDescription>
                เลือกหมวดเพื่อแก้ไขการตั้งค่าระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col gap-2">
                {SECTIONS.map((s) => (
                  <Button
                    key={s.key}
                    variant={active === s.key ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setActive(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-3">
          {active === "users" && (
            <div className="space-y-4">
              {/* Sub-tabs: Admin / User / Officer */}
              <div className="flex gap-1 rounded-lg border bg-muted p-1">
                {USER_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setUserTab(t.key)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      userTab === t.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {userTab === "admin" && <UserManagement roleFilter="admin" />}
              {userTab === "user" && <UserManagement roleFilter="user" />}
              {userTab === "officer" && <OfficerManagement />}
            </div>
          )}
          {active === "data" && <DataManagement />}
        </section>
      </div>
    </div>
  );
}
