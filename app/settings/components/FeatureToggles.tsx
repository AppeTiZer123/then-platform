"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const FEATURES = [
  { id: "f1", name: "ระบบแจ้งเตือน", enabled: true },
  { id: "f2", name: "ระบบอนุมัติอัตโนมัติ", enabled: false },
]

export default function FeatureToggles() {
  const [features, setFeatures] = useState(FEATURES)

  const toggle = (id: string) => setFeatures((f) => f.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>เปิด/ปิดฟีเจอร์ของระบบ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {features.map((f) => (
            <div key={f.id} className="flex items-center justify-between">
              <div className="text-sm">{f.name}</div>
              <Button size="sm" onClick={() => toggle(f.id)}>{f.enabled ? "เปิด" : "ปิด"}</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
