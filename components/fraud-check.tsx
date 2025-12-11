"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchFraudAccount, formatCurrency } from "@/lib/mock-data";
import { FraudAccount } from "@/lib/types";

export function FraudCheck() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FraudAccount | null | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const found = searchFraudAccount(query);
    setResult(found);
    setIsSearching(false);
  };

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

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            ตรวจสอบบัญชีมิจฉาชีพ
          </h2>
          <p className="text-muted-foreground">
            กรอกเลขบัญชีธนาคารหรือเบอร์โทรศัพท์เพื่อตรวจสอบว่าอยู่ในรายการบัญชีมิจฉาชีพหรือไม่
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="เลขบัญชีธนาคาร หรือ เบอร์โทรศัพท์"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "ตรวจสอบ"
              )}
            </Button>
          </div>
        </form>

        {/* Search Results */}
        <div className="max-w-xl mx-auto">
          {isSearching && (
            <Card className="border-muted">
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">กำลังตรวจสอบ...</span>
              </CardContent>
            </Card>
          )}

          {!isSearching && result === null && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CardContent className="flex items-start gap-4 py-6">
                <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                    ไม่พบในรายการมิจฉาชีพ
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    หมายเลข &quot;{query}&quot; ไม่อยู่ในฐานข้อมูลบัญชีมิจฉาชีพของเรา
                    แต่กรุณาใช้วิจารณญาณในการทำธุรกรรมเสมอ
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isSearching && result && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-red-800 dark:text-red-300">
                        พบในรายการมิจฉาชีพ!
                      </CardTitle>
                      <CardDescription className="text-red-600 dark:text-red-400">
                        หมายเลขนี้มีรายงานการหลอกลวง
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">เลขบัญชี:</span>
                    <p className="font-medium">{result.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ธนาคาร:</span>
                    <p className="font-medium">{result.bankName}</p>
                  </div>
                  {result.accountName && (
                    <div>
                      <span className="text-muted-foreground">ชื่อบัญชี:</span>
                      <p className="font-medium">{result.accountName}</p>
                    </div>
                  )}
                  {result.phoneNumber && (
                    <div>
                      <span className="text-muted-foreground">เบอร์โทร:</span>
                      <p className="font-medium">{result.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">จำนวนรายงาน:</span>
                    <p className="font-medium text-red-600">{result.reportCount} ครั้ง</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ความเสียหายรวม:</span>
                    <p className="font-medium text-red-600">{formatCurrency(result.totalDamage)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>คำเตือน:</strong> อย่าโอนเงินให้บัญชีนี้! 
                    หากถูกหลอกลวงไปแล้ว กรุณาแจ้งความทันที
                  </p>
                  <Button variant="destructive" className="mt-3 w-full" asChild>
                    <a href="/report">แจ้งความออนไลน์</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Example searches */}
        {result === undefined && !isSearching && (
          <div className="max-w-xl mx-auto mt-6 text-center text-sm text-muted-foreground">
            <p>ลองค้นหา: <button onClick={() => setQuery("123-4-56789-0")} className="text-primary hover:underline">123-4-56789-0</button> หรือ <button onClick={() => setQuery("081-234-5678")} className="text-primary hover:underline">081-234-5678</button></p>
          </div>
        )}
      </div>
    </section>
  );
}
