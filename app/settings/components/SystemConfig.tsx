"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SystemConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>การตั้งค่าระบบ</CardTitle>
        <CardDescription>ชื่อระบบ โลโก้ ภาษา และการแจ้งเตือน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อระบบ</label>
            <Input placeholder="THEN Platform" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">โลโก้ (URL)</label>
            <Input placeholder="https://.../logo.png" />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => alert("บันทึก (ตัวอย่าง)")}>บันทึก</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
