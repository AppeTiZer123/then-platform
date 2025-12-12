"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RolesPermissions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>สิทธิ์ & บทบาท</CardTitle>
        <CardDescription>สร้างบทบาทใหม่และมอบสิทธิ์ให้เมนูต่าง ๆ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Admin</div>
              <div className="text-sm text-muted-foreground">สิทธิ์เต็ม</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">แก้ไข</Button>
              <Button size="sm">สร้างสำเนา</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={() => alert("สร้างบทบาทใหม่ (ตัวอย่าง)")}>สร้างบทบาทใหม่</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
