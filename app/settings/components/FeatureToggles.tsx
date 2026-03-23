"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { id: "f1", name: "ระบบแจ้งเตือน", enabled: true },
  { id: "f2", name: "ระบบอนุมัติอัตโนมัติ", enabled: false },
];

export default function FeatureToggles() {
  const [features, setFeatures] = useState(FEATURES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("then_feature_toggles");
      if (saved) setFeatures(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFeatures((f) => {
      const updated = f.map((x) =>
        x.id === id ? { ...x, enabled: !x.enabled } : x,
      );
      try {
        localStorage.setItem("then_feature_toggles", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>เปิด/ปิดฟีเจอร์ของระบบ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {features.map((f) => (
            <div key={f.id} className="flex items-center justify-between">
              <div className="text-sm">{f.name}</div>
              <Button
                size="sm"
                variant={f.enabled ? "default" : "outline"}
                onClick={() => toggle(f.id)}
              >
                {f.enabled ? "เปิด ✓" : "ปิด"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
