"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { mockFraudAccounts, formatCurrency } from "@/lib/mock-data";
import { FraudAccount } from "@/lib/types";

const getStatusBadge = (status: FraudAccount["status"]) => {
  switch (status) {
    case "confirmed":
      return <Badge variant="destructive">ยืนยันแล้ว</Badge>;
    case "investigating":
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">กำลังตรวจสอบ</Badge>;
    case "pending":
      return <Badge variant="outline">รอตรวจสอบ</Badge>;
  }
};

export default function FraudListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fraudAccounts] = useState(mockFraudAccounts);

  const filteredAccounts = fraudAccounts.filter((account) => {
    return (
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">รายการบัญชีมิจฉาชีพ</h2>
          <p className="text-sm text-muted-foreground">จัดการรายการบัญชีที่ถูกแจ้งว่าเป็นมิจฉาชีพ</p>
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
                กรอกข้อมูลบัญชีที่ต้องการเพิ่มในรายการมิจฉาชีพ
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">เลขบัญชี *</label>
                <Input placeholder="xxx-x-xxxxx-x" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">ธนาคาร *</label>
                <Input placeholder="ชื่อธนาคาร" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">ชื่อบัญชี</label>
                <Input placeholder="ชื่อเจ้าของบัญชี" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">เบอร์โทรศัพท์</label>
                <Input placeholder="08x-xxx-xxxx" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="flex-1">
                  บันทึก
                </Button>
              </div>
            </form>
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">เลขบัญชี</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">ธนาคาร</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">ชื่อบัญชี</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">รายงาน</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">ความเสียหาย</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">สถานะ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">{account.accountNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm">{account.bankName}</span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-sm">{account.accountName || "-"}</span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <Badge variant="secondary">{account.reportCount} ครั้ง</Badge>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="text-sm font-medium text-destructive">
                        {formatCurrency(account.totalDamage)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(account.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
              ความเสียหายรวม: <span className="font-medium text-destructive">
                {formatCurrency(filteredAccounts.reduce((sum, a) => sum + a.totalDamage, 0))}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
