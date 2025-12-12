"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ความปลอดภัย</CardTitle>
        <CardDescription>รหัสผ่านขั้นต่ำ, 2FA, IP และ Audit logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">รหัสผ่านขั้นต่ำ</div>
              <div className="text-sm text-muted-foreground">เช่น ความยาวขั้นต่ำ 8 ตัวอักษร</div>
            </div>
            <Button size="sm" onClick={() => alert("แก้ไขนโยบายรหัสผ่าน (ตัวอย่าง)")}>แก้ไข</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-medium">Audit Logs</div>
            <Button size="sm" variant="outline" onClick={() => alert("ดาวน์โหลด logs (ตัวอย่าง)")}>ดาวน์โหลด</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
