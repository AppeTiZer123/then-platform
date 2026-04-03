"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import DataManagement from "./components/DataManagement";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Admin Settings</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>เมนูตั้งค่า</CardTitle>
              <CardDescription>
                แสดงเฉพาะส่วนการจัดการข้อมูล
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col gap-2">
                <div className="rounded-md bg-muted px-3 py-2 text-sm font-medium">
                  การจัดการข้อมูล
                </div>
              </nav>
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-3">
          <DataManagement />
        </section>
      </div>
    </div>
  );
}
