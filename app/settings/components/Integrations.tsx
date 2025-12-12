"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Integrations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>จัดการ API keys, Webhooks และการเชื่อมต่อภายนอก</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">API Keys</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => alert("สร้าง API key (ตัวอย่าง)")}>สร้าง</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">Webhooks</div>
            <Button size="sm" variant="outline" onClick={() => alert("จัดการ Webhooks (ตัวอย่าง)")}>จัดการ</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
