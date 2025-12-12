"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import UserManagement from "./components/UserManagement"
import RolesPermissions from "./components/RolesPermissions"
import SystemConfig from "./components/SystemConfig"
import DataManagement from "./components/DataManagement"
import SecuritySettings from "./components/SecuritySettings"
import FeatureToggles from "./components/FeatureToggles"
import Integrations from "./components/Integrations"

const SECTIONS = [
  { key: "users", label: "การจัดการผู้ใช้" },
  { key: "roles", label: "สิทธิ์/บทบาท" },
  { key: "system", label: "การตั้งค่าระบบ" },
  { key: "data", label: "การจัดการข้อมูล" },
  { key: "security", label: "ความปลอดภัย" },
  { key: "features", label: "Feature Toggles" },
  { key: "integrations", label: "Integrations" },
]

export default function SettingsPage() {
  const [active, setActive] = useState<string>("users")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Admin Settings</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>เมนูตั้งค่า</CardTitle>
              <CardDescription>เลือกหมวดเพื่อแก้ไขการตั้งค่าระบบ</CardDescription>
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
          {active === "users" && <UserManagement />}
          {active === "roles" && <RolesPermissions />}
          {active === "system" && <SystemConfig />}
          {active === "data" && <DataManagement />}
          {active === "security" && <SecuritySettings />}
          {active === "features" && <FeatureToggles />}
          {active === "integrations" && <Integrations />}
        </section>
      </div>
    </div>
  )
}
