"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

type ModalType = "edit" | "audit" | null

export default function SecuritySettings() {
  const [modal, setModal] = useState<ModalType>(null)
  const [minLength, setMinLength] = useState(8)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // load existing policy
    fetch('/api/admin/settings/password-policy')
      .then((res) => res.json())
      .then((json) => { if (json?.minLength) setMinLength(Number(json.minLength)) })
      .catch(() => {})
  }, [])

  function handleSavePolicy() {
    // call server API to persist
    setIsSaving(true)
    setError(null)
    fetch('/api/admin/settings/password-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minLength })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
        setModal(null)
      })
      .catch(() => setError('ไม่สามารถบันทึกได้ ลองอีกครั้ง'))
      .finally(() => setIsSaving(false))
  }

  

  return (
    <>
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
                <div className="text-sm text-muted-foreground">เช่น ความยาวขั้นต่ำ {minLength} ตัวอักษร</div>
              </div>
              <div className="flex items-center gap-3">
                {isSaved && <div className="text-sm text-green-600">บันทึกแล้ว</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                <Button size="sm" onClick={() => setModal("edit")}>แก้ไข</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="font-medium">Audit Logs</div>
              <Button size="sm" variant="outline" onClick={() => setModal("audit")}>ดาวน์โหลด</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit policy modal */}
      <Dialog open={modal === "edit"} onOpenChange={(open) => { if (!open) setModal(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>แก้ไขนโยบายรหัสผ่าน</DialogTitle>
          <DialogDescription className="mb-4">ตั้งค่าความยาวขั้นต่ำของรหัสผ่าน</DialogDescription>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
              <label className="text-sm sm:col-span-1">ความยาวขั้นต่ำ</label>
              <div className="sm:col-span-3 flex items-center gap-3">
                <input
                  type="number"
                  min={4}
                  max={64}
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="w-20 h-9 rounded-md border border-input px-3"
                  aria-label="ความยาวขั้นต่ำ"
                />

                <input
                  type="range"
                  min={4}
                  max={64}
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="w-full"
                  aria-label="ปรับความยาวขั้นต่ำ"
                />
              </div>
            </div>

            <div>
              {minLength >= 8 ? (
                <div className="text-sm text-muted-foreground">แนะนำ: อย่างน้อย 8 ตัวอักษร (ปลอดภัยกว่า)</div>
              ) : (
                <div className="text-sm text-red-600">ข้อผิดพลาด: ต้องมีความยาวอย่างน้อย 8 ตัวอักษร</div>
              )}
            </div>

            <div className="rounded-md border border-border bg-slate-50 p-3 text-sm">
              <div className="font-medium">Preview นโยบาย</div>
              <div className="text-muted-foreground mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย {minLength} ตัวอักษร และควรประกอบด้วยตัวอักษรตัวพิมพ์ใหญ่/เล็ก ตัวเลข และอักขระพิเศษ</div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setModal(null)}>ยกเลิก</Button>
              <Button onClick={handleSavePolicy} disabled={minLength < 8}>บันทึก</Button>
            </div>
          </div>

          <DialogClose asChild>
            <button className="sr-only">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Audit preview modal */}
      <Dialog open={modal === "audit"} onOpenChange={(open) => { if (!open) setModal(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>ตัวอย่าง: Audit Logs</DialogTitle>
          <DialogDescription className="mb-4">ตัวอย่างบันทึกเหตุการณ์ล่าสุด (ตัวอย่าง)</DialogDescription>

          <div className="overflow-auto rounded-md border border-border bg-slate-50 p-3 text-sm">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 pr-4">เวลา</th>
                  <th className="pb-2 pr-4">ผู้ใช้</th>
                  <th className="pb-2 pr-4">เหตุการณ์</th>
                  <th className="pb-2">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-2">2025-12-19 09:12</td>
                  <td className="py-2">admin@example.test</td>
                  <td className="py-2">เข้าสู่ระบบ</td>
                  <td className="py-2">สำเร็จจาก IP 203.0.113.12</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">2025-12-18 16:44</td>
                  <td className="py-2">user1@example.test</td>
                  <td className="py-2">เปลี่ยนรหัสผ่าน</td>
                  <td className="py-2">ความยาวใหม่ 12 ตัวอักษร</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">2025-12-17 11:01</td>
                  <td className="py-2">user2@example.test</td>
                  <td className="py-2">ล้มเหลวเข้าสู่ระบบ</td>
                  <td className="py-2">รหัสผ่านผิด 3 ครั้ง</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setModal(null)}>ปิด</Button>
            <Button onClick={() => {
              const csv = "time,user,event,detail\n2025-12-19 09:12,admin@example.test,login,success from IP 203.0.113.12\n2025-12-18 16:44,user1@example.test,password_change,length 12\n2025-12-17 11:01,user2@example.test,login_failed,3 attempts";
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'audit-logs-sample.csv';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}>ดาวน์โหลด</Button>
          </div>

          <DialogClose asChild>
            <button className="sr-only">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  )
}
