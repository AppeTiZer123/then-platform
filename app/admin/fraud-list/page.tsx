"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { mockFraudAccounts, formatCurrency } from "@/lib/mock-data";
import { getAllFraudAccounts } from "@/lib/actions/fraud";

// Type สำหรับ fraud account
interface FraudAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName: string | null;
  phoneNumber: string | null;
  reportCount: number | null;
  totalDamage: string | null;
  status: string | null;
  lastReportedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const getStatusBadge = (status: FraudAccount["status"]) => {
  switch (status) {
    case "confirmed":
      return <Badge variant="destructive">ยืนยันแล้ว</Badge>;
    case "investigating":
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
          กำลังตรวจสอบ
        </Badge>
      );
    case "pending":
      return <Badge variant="outline">รอตรวจสอบ</Badge>;
  }
};

export default function FraudListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    accountIdSelection: "", // id of existing account to autofill (or empty for new)
    accountNumber: "",
    bankName: "",
    accountName: "",
    phoneNumber: "",
    reportCount: 0,
    totalDamage: 0,
    status: "pending" as FraudAccount["status"],
  });
  const [fraudAccountsList, setFraudAccountsList] = useState<FraudAccount[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<FraudAccount | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    accountNumber: "",
    bankName: "",
    accountName: "",
    phoneNumber: "",
    reportCount: 0,
    totalDamage: 0,
    status: "pending" as FraudAccount["status"],
  });

  // ดึงข้อมูลจาก database
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllFraudAccounts();
        setFraudAccountsList(data);
      } catch (error) {
        console.error("Failed to fetch fraud accounts:", error);
        // Fallback to mock data if database fails
        setFraudAccountsList(mockFraudAccounts as unknown as FraudAccount[]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAccounts = fraudAccountsList.filter((account) => {
    return (
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openEdit = (account: FraudAccount) => {
    setSelectedAccount(account);
    setEditForm({
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountName: account.accountName || "",
      phoneNumber: account.phoneNumber || "",
      reportCount: account.reportCount || 0,
      totalDamage: parseFloat(account.totalDamage || "0"),
      status: (account.status as "confirmed" | "pending") || "pending",
    });
    setIsEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    // TODO: เพิ่ม Server Action สำหรับ update database
    setFraudAccountsList((prev) =>
      prev.map((a) =>
        a.id === selectedAccount.id
          ? {
              ...a,
              ...{
                accountNumber: editForm.accountNumber,
                bankName: editForm.bankName,
                accountName: editForm.accountName,
                phoneNumber: editForm.phoneNumber,
                reportCount: Number(editForm.reportCount),
                totalDamage: String(editForm.totalDamage),
                status: editForm.status,
              },
            }
          : a,
      ),
    );
    setIsEditOpen(false);
    setSelectedAccount(null);
  };

  const openDelete = (account: FraudAccount) => {
    setSelectedAccount(account);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedAccount) return;
    // TODO: เพิ่ม Server Action สำหรับ delete จาก database
    setFraudAccountsList((prev) =>
      prev.filter((a) => a.id !== selectedAccount.id),
    );
    setIsDeleteOpen(false);
    setSelectedAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">รายการบัญชีมิจฉาชีพ</h2>
          <p className="text-sm text-muted-foreground">
            จัดการรายการบัญชีที่ถูกแจ้งว่าเป็นมิจฉาชีพ
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มบัญชี
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มบัญชีมิจฉาชีพ</DialogTitle>
              <DialogDescription>
                เลือกบัญชีจากรายการหรือกรอกข้อมูลเอง แล้วกดบันทึก
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4 mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                // add new account
                const newAccount: FraudAccount = {
                  id: String(Date.now()),
                  accountNumber: addForm.accountNumber,
                  bankName: addForm.bankName,
                  accountName: addForm.accountName || null,
                  phoneNumber: addForm.phoneNumber || null,
                  reportCount: Number(addForm.reportCount) || 0,
                  totalDamage: String(addForm.totalDamage) || "0",
                  lastReportedAt: new Date(),
                  status: addForm.status,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                setFraudAccountsList((prev) => [newAccount, ...prev]);
                setIsAddDialogOpen(false);
                setAddForm({
                  accountIdSelection: "",
                  accountNumber: "",
                  bankName: "",
                  accountName: "",
                  phoneNumber: "",
                  reportCount: 0,
                  totalDamage: 0,
                  status: "pending",
                });
              }}
            >
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  เลขบัญชี *
                </label>
                <Input
                  value={addForm.accountNumber}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, accountNumber: e.target.value }))
                  }
                  placeholder="xxx-x-xxxxx-x"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ธนาคาร *
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={addForm.bankName}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, bankName: e.target.value }))
                  }
                >
                  <option value="">-- เลือกธนาคาร --</option>
                  {[...new Set(mockFraudAccounts.map((a) => a.bankName))].map(
                    (b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ชื่อบัญชี
                </label>
                <Input
                  value={addForm.accountName}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, accountName: e.target.value }))
                  }
                  placeholder="ชื่อเจ้าของบัญชี"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  เบอร์โทรศัพท์
                </label>
                <Input
                  value={addForm.phoneNumber}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, phoneNumber: e.target.value }))
                  }
                  placeholder="08x-xxx-xxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    จำนวนรายงาน
                  </label>
                  <Input
                    type="number"
                    value={String(addForm.reportCount)}
                    onChange={(e) =>
                      setAddForm((s) => ({
                        ...s,
                        reportCount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    ความเสียหาย (บาท)
                  </label>
                  <Input
                    type="number"
                    value={String(addForm.totalDamage)}
                    onChange={(e) =>
                      setAddForm((s) => ({
                        ...s,
                        totalDamage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setAddForm({
                      accountIdSelection: "",
                      accountNumber: "",
                      bankName: "",
                      accountName: "",
                      phoneNumber: "",
                      reportCount: 0,
                      totalDamage: 0,
                      status: "pending",
                    });
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" className="flex-1">
                  บันทึก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Edit dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ดู / แก้ไข บัญชี</DialogTitle>
              <DialogDescription>ตรวจสอบและแก้ไขข้อมูลบัญชี</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleEditSave}>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  เลขบัญชี
                </label>
                <Input
                  value={editForm.accountNumber}
                  onChange={(e) =>
                    setEditForm((s) => ({
                      ...s,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ธนาคาร
                </label>
                <Input
                  value={editForm.bankName}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, bankName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ชื่อบัญชี
                </label>
                <Input
                  value={editForm.accountName}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, accountName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  เบอร์โทรศัพท์
                </label>
                <Input
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, phoneNumber: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    จำนวนรายงาน
                  </label>
                  <Input
                    type="number"
                    value={String(editForm.reportCount)}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        reportCount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    ความเสียหาย (บาท)
                  </label>
                  <Input
                    type="number"
                    value={String(editForm.totalDamage)}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        totalDamage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedAccount(null);
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" className="flex-1">
                  บันทึก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบ</DialogTitle>
              <DialogDescription>
                คุณต้องการลบบัญชีนี้จริงหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedAccount(null);
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleConfirmDelete}
              >
                ลบ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลขบัญชี, ชื่อธนาคาร, ชื่อบัญชี หรือ เบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fraud List Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    เลขบัญชี
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    ธนาคาร
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    ชื่อบัญชี
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    รายงาน
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    ความเสียหาย
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    สถานะ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">
                          {account.accountNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm">{account.bankName}</span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-sm">
                        {account.accountName || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <Badge variant="secondary">
                        {account.reportCount || 0} ครั้ง
                      </Badge>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="text-sm font-medium text-destructive">
                        {formatCurrency(parseFloat(account.totalDamage || "0"))}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(
                        account.status as
                          | "confirmed"
                          | "investigating"
                          | "pending",
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                          onClick={() => openDelete(account)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ไม่พบรายการที่ค้นหา</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              ทั้งหมด {filteredAccounts.length} บัญชี
            </p>
            <p className="text-sm text-muted-foreground">
              ความเสียหายรวม:{" "}
              <span className="font-medium text-destructive">
                {formatCurrency(
                  filteredAccounts.reduce(
                    (sum, a) => sum + parseFloat(a.totalDamage || "0"),
                    0,
                  ),
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
