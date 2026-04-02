"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type Officer = {
  id: string
  userId: string | null
  rank: string | null
  department: string | null
  isActive: boolean
  createdAt: string
  userName: string | null
  userPhone: string | null
  userEmail: string | null
}

type UserOption = {
  id: string
  name: string | null
  phone: string
  email: string | null
}

export default function OfficerManagement() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ userId: "", rank: "", department: "" })

  // edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ rank: "", department: "" })

  useEffect(() => {
    let mounted = true

    async function loadOfficers() {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/officers")
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        if (mounted) setOfficers(json.data || [])
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users")
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setUsers(json.users || [])
      } catch {
        // non-critical
      }
    }

    loadOfficers()
    loadUsers()

    return () => { mounted = false }
  }, [])

  const filtered = officers.filter((o) => {
    const searchTarget = `${o.userName || ""} ${o.rank || ""} ${o.department || ""} ${o.userPhone || ""}`.toLowerCase()
    return searchTarget.includes(query.toLowerCase())
  })

  // ผู้ใช้ที่ยังไม่ได้เป็น officer
  const availableUsers = users.filter(
    (u) => !officers.some((o) => o.userId === u.id),
  )

  const submitAdd = async () => {
    if (!addForm.userId) {
      alert("กรุณาเลือกผู้ใช้")
      return
    }

    try {
      const res = await fetch("/api/admin/officers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(addForm),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "ไม่สามารถเพิ่มเจ้าหน้าที่ได้")

      // reload officers to get full data with user join
      const reloadRes = await fetch("/api/admin/officers")
      if (reloadRes.ok) {
        const reloadJson = await reloadRes.json()
        setOfficers(reloadJson.data || [])
      }

      setAddOpen(false)
      setAddForm({ userId: "", rank: "", department: "" })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    }
  }

  const openEdit = (o: Officer) => {
    setEditingId(o.id)
    setEditForm({ rank: o.rank || "", department: o.department || "" })
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/admin/officers/${editingId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "ไม่สามารถแก้ไขข้อมูลได้")

      setOfficers((prev) =>
        prev.map((o) =>
          o.id === editingId
            ? { ...o, rank: editForm.rank || null, department: editForm.department || null }
            : o,
        ),
      )

      setEditOpen(false)
      setEditingId(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    }
  }

  const removeOfficer = async (id: string) => {
    if (!confirm("ต้องการปลดเจ้าหน้าที่คนนี้ใช่หรือไม่?")) return

    try {
      const res = await fetch(`/api/admin/officers/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "ไม่สามารถลบได้")
      }
      setOfficers((prev) => prev.filter((o) => o.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>จัดการเจ้าหน้าที่</CardTitle>
          <CardDescription>เพิ่ม, แก้ไข ข้อมูลเจ้าหน้าที่ผู้รับผิดชอบเคส</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <Input
                className="flex-1"
                placeholder="ค้นหาชื่อ, ยศ, หน่วยงาน..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">เพิ่มเจ้าหน้าที่</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มเจ้าหน้าที่ใหม่</DialogTitle>
                    <DialogDescription>เลือกผู้ใช้ที่ต้องการแต่งตั้งเป็นเจ้าหน้าที่</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 py-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">เลือกผู้ใช้ *</label>
                      <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={addForm.userId}
                        onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })}
                      >
                        <option value="">-- เลือกผู้ใช้ --</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || "ไม่ระบุชื่อ"} ({u.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ยศ / ตำแหน่ง</label>
                      <Input
                        placeholder="เช่น พ.ต.ท., ร.ต.อ."
                        value={addForm.rank}
                        onChange={(e) => setAddForm({ ...addForm, rank: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">หน่วยงาน / สังกัด</label>
                      <Input
                        placeholder="เช่น กองบังคับการปราบปรามการกระทำความผิดเกี่ยวกับอาชญากรรมทางเทคโนโลยี"
                        value={addForm.department}
                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setAddOpen(false)}>ยกเลิก</Button>
                      <Button onClick={submitAdd}>เพิ่มเจ้าหน้าที่</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4">
            {loading && <div className="text-sm text-muted-foreground">กำลังโหลด...</div>}
            {error && <div className="text-sm text-destructive">{error}</div>}
            {!loading && !error && (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full table-auto p-2">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="p-2">ชื่อ</th>
                      <th className="p-2">เบอร์โทร</th>
                      <th className="p-2">ยศ / ตำแหน่ง</th>
                      <th className="p-2">หน่วยงาน</th>
                      <th className="p-2">วันที่เพิ่ม</th>
                      <th className="p-2">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-sm text-muted-foreground">
                          ยังไม่มีเจ้าหน้าที่
                        </td>
                      </tr>
                    )}
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-2">{o.userName || "-"}</td>
                        <td className="p-2">{o.userPhone || "-"}</td>
                        <td className="p-2">{o.rank || "-"}</td>
                        <td className="p-2">{o.department || "-"}</td>
                        <td className="p-2">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="p-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(o)}>แก้ไข</Button>
                          <Button size="sm" variant="ghost" onClick={() => removeOfficer(o.id)}>ปลด</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit officer dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลเจ้าหน้าที่</DialogTitle>
            <DialogDescription>ปรับปรุงยศและหน่วยงาน</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">ยศ / ตำแหน่ง</label>
              <Input
                value={editForm.rank}
                onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">หน่วยงาน / สังกัด</label>
              <Input
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>ยกเลิก</Button>
              <Button onClick={submitEdit}>บันทึก</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
