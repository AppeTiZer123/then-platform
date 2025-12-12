"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DataManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>การจัดการข้อมูล</CardTitle>
        <CardDescription>สำรองข้อมูล นำเข้า/ส่งออก และการตั้งค่า DB</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">สำรองข้อมูล (Backup)</div>
            <Button size="sm" onClick={() => alert("เริ่มสำรองข้อมูล (ตัวอย่าง)")}>เริ่ม</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">นำเข้า/ส่งออกข้อมูล</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => alert("นำเข้า (ตัวอย่าง)")}>นำเข้า</Button>
              <Button size="sm" variant="outline" onClick={() => alert("ส่งออก (ตัวอย่าง)")}>ส่งออก</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
