"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
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

const ROLES = ["admin", "user"]

type User = {
  id: string
  name: string
  email: string
  role: string
  isVerified?: boolean
  phone?: string
  createdAt?: string
}


export default function UserManagement() {
  const { data: session, update } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/users")
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        if (mounted) setUsers(json.users || [])
      } catch (err: any) {
        console.error(err)
        if (mounted) setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(query.toLowerCase()) || (u.email || "").toLowerCase().includes(query.toLowerCase())
  )

  const toggleSuspend = (id: string) => {
    // call API to toggle suspend
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "toggleSuspend" }),
        })
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        // refresh list
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: json.user?.role || (u.role === "suspended" ? "user" : "suspended") } : u)))

        // If we changed the role of the current user, refresh session so UI/middleware sees new role
        if (session?.user?.id === id && update) {
          try {
            await update({ refresh: true })
          } catch (e) {
            console.error("Failed to refresh session after role change", e)
          }
        }
      } catch (err) {
        console.error(err)
      }
    })()
  }

  const removeUser = (id: string) => {
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
        if (!res.ok) throw new Error(await res.text())
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } catch (err) {
        console.error(err)
      }
    })()
  }

  const changeRole = (id: string, newRole: string) => {
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "changeRole", role: newRole }),
        })
        if (!res.ok) {
          let err = "Server error"
          try { const j = await res.json(); if (j?.error) err = j.error } catch (_) { try { err = await res.text() } catch(_) {} }
          throw new Error(err)
        }
        const json = await res.json()
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: json.user?.role || newRole } : u)))

        if (session?.user?.id === id && update) {
          try { await update({ refresh: true }) } catch (e) { console.error(e) }
        }
      } catch (err: any) {
        console.error(err)
        alert(err?.message || "ไม่สามารถเปลี่ยนบทบาทได้")
      }
    })()
  }

  // add user dialog state
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "user", invite: false })
  // edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "user" })

  const submitAdd = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setUsers((prev) => [json.user, ...prev])
      setOpen(false)
      setForm({ name: "", email: "", phone: "", role: "staff", invite: false })
    } catch (err) {
      console.error(err)
      alert("ไม่สามารถเพิ่มผู้ใช้ได้")
    }
  }

  const openEdit = (u: User) => {
    setEditingId(u.id)
    setEditForm({ name: u.name || "", email: u.email || "", phone: (u as any).phone || "", role: u.role || "user" })
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!editingId) return
    try {
      const body: any = { action: "update" }
      if (editForm.name !== undefined) body.name = editForm.name
      if (editForm.email !== undefined && editForm.email !== "") body.email = editForm.email
      // only send phone if non-empty to avoid violating NOT NULL/unique constraints
      if (editForm.phone !== undefined && editForm.phone !== "") body.phone = editForm.phone
      if (editForm.role !== undefined) body.role = editForm.role
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        let errMsg = "Server error"
        try {
          const ct = res.headers.get("content-type") || ""
          if (ct.includes("application/json")) {
            const j = await res.json()
            if (j?.error) errMsg = j.error
            else errMsg = JSON.stringify(j)
          } else {
            errMsg = await res.text()
          }
        } catch (_){ }
        alert(errMsg)
        return
      }
      const json = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...json.user } : u)))

      // refresh session if current user was edited
      if (editingId === session?.user?.id && update) {
        try { await update({ refresh: true }) } catch (e) { console.error(e) }
      }

      setEditOpen(false)
      setEditingId(null)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "ไม่สามารถบันทึกการแก้ไขได้")
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การจัดการผู้ใช้</CardTitle>
          <CardDescription>เพิ่ม, แก้ไข ข้อมูลของผู้ใช้</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <Input className="flex-1" placeholder="ค้นหาชื่อหรืออีเมล" value={query} onChange={(e) => setQuery(e.target.value)} />

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">เพิ่มผู้ใช้</Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
                  <DialogDescription>กรอกข้อมูลเพื่อสร้างบัญชีใหม่หรือส่งคำเชิญ</DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">ชื่อ</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">อีเมล</label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">บทบาท</label>
                    <select className="w-full rounded-md border px-3 py-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input id="invite" type="checkbox" checked={form.invite} onChange={(e) => setForm({ ...form, invite: e.target.checked })} />
                    <label htmlFor="invite" className="text-sm">ส่งอีเมลเชิญให้สร้างบัญชี</label>
                  </div>
                </div>

                <DialogFooter>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                    <Button onClick={submitAdd}>สร้าง</Button>
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
                      <th className="p-2">อีเมล</th>
                      <th className="p-2">บทบาท</th>
                      <th className="p-2">วันที่สร้างบัญชี</th>
                      <th className="p-2">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "-"}</td>
                        <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) : "-"}</td>
                          <td className="p-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(u)}>แก้ไข</Button>
                            <Button size="sm" variant="ghost" onClick={() => removeUser(u.id)}>ลบ</Button>
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

      {/* Edit user dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
            <DialogDescription>ปรับปรุงข้อมูลผู้ใช้</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อ</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล</label>
              <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">บทบาท</label>
              <select className="w-full rounded-md border px-3 py-1" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
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
