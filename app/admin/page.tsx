import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { getAllReports } from "@/lib/actions/reports";
import { getAllFraudAccounts } from "@/lib/actions/fraud";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          รอดำเนินการ
        </Badge>
      );
    case "in_progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          กำลังดำเนินการ
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          เสร็จสิ้น
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default async function AdminDashboard() {
  const [allReports, allFraudAccounts] = await Promise.all([
    getAllReports(),
    getAllFraudAccounts(),
  ]);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dashboardStats = {
    totalReports: allReports.length,
    pendingReports: allReports.filter(
      (r) => r.status === "pending" || r.status === "tip",
    ).length,
    inProgressReports: allReports.filter((r) => r.status === "in_progress")
      .length,
    completedReports: allReports.filter((r) => r.status === "completed").length,
    totalFraudAccounts: allFraudAccounts.length,
    totalDamageAmount: allReports.reduce(
      (sum, r) => sum + parseFloat(String(r.damageAmount || "0")),
      0,
    ),
    todayReports: allReports.filter(
      (r) =>
        r.createdAt &&
        new Date(r.createdAt).toISOString().split("T")[0] === todayStr,
    ).length,
    weeklyReports: allReports.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= weekAgo,
    ).length,
  };

  const stats = [
    {
      title: "คดีทั้งหมด",
      value: dashboardStats.totalReports,
      changeType: "neutral" as const,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "รอดำเนินการ",
      value: dashboardStats.pendingReports,
      changeType: "negative" as const,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "กำลังดำเนินการ",
      value: dashboardStats.inProgressReports,
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "บัญชีมิจฉาชีพ",
      value: dashboardStats.totalFraudAccounts,
      changeType: "neutral" as const,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  const recentReports = allReports.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // decide link target
          const href =
            stat.title === "บัญชีมิจฉาชีพ"
              ? "/admin/fraud-list"
              : stat.title === "คดีทั้งหมด"
                ? "/admin/reports"
                : `/admin/reports?status=${stat.title === "แจ้งเบาะแส" ? "tip" : stat.title === "ออกเอกสารแล้ว" ? "completed" : ""}`;

          return (
            <Link
              key={index}
              href={href}
              className="block transform transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`${stat.color} p-2.5 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สรุปวันนี้</CardTitle>
            <CardDescription>ข้อมูลสถิติประจำวัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {dashboardStats.todayReports}
                </p>
                <p className="text-sm text-muted-foreground mt-1">คดีวันนี้</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {dashboardStats.weeklyReports}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  คดีสัปดาห์นี้
                </p>
              </div>
              <div className="col-span-2 text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(dashboardStats.totalDamageAmount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ความเสียหายรวม
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การดำเนินการด่วน</CardTitle>
            <CardDescription>รายการที่ต้องดำเนินการ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/reports?status=tip" className="block">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900 hover:shadow-sm hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">เบาะแสใหม่</p>
                    <p className="text-xs text-muted-foreground">
                      รายงานจากผู้ใช้
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {dashboardStats.pendingReports}
                </Badge>
              </div>
            </Link>

            <Link href="/admin/reports?status=in_progress" className="block">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 hover:shadow-sm hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">กำลังดำเนินการ</p>
                    <p className="text-xs text-muted-foreground">รอติดตามผล</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {dashboardStats.inProgressReports}
                </Badge>
              </div>
            </Link>

            <Link href="/admin/reports?status=completed" className="block">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900 hover:shadow-sm hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">เสร็จสิ้นแล้ว</p>
                    <p className="text-xs text-muted-foreground">เดือนนี้</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {dashboardStats.completedReports}
                </Badge>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">คดีล่าสุด</CardTitle>
          <CardDescription>รายการแจ้งความที่เข้ามาล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    หมายเลข
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    ผู้แจ้ง
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    ความเสียหาย
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      ยังไม่มีคดีในระบบ
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-sm">
                          {report.caseNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium">
                            {report.reporterName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.reporterPhone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-sm font-medium text-destructive">
                          {formatCurrency(
                            parseFloat(String(report.damageAmount || "0")),
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(report.status || "")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
