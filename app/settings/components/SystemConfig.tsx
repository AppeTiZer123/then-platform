"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SystemConfig() {
  const [systemName, setSystemName] = useState("THEN Platform");
  const [logoUrl, setLogoUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("then_system_config");
      if (v) {
        const c = JSON.parse(v);
        setSystemName(c.systemName || "THEN Platform");
        setLogoUrl(c.logoUrl || "");
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        "then_system_config",
        JSON.stringify({ systemName, logoUrl }),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>การตั้งค่าระบบ</CardTitle>
        <CardDescription>ชื่อระบบ โลโก้ ภาษา และการแจ้งเตือน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อระบบ</label>
            <Input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="THEN Platform"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              โลโก้ (URL)
            </label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {saved ? "บันทึกแล้ว ✓" : "บันทึก"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
