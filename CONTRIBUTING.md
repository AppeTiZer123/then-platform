# 📘 คู่มือสำหรับนักพัฒนา - THEN App

ยินดีต้อนรับเข้าสู่ทีมพัฒนา **THEN** (Thai Electronics Fraud Helpline Network)! 🎉

เอกสารนี้จะช่วยให้คุณเข้าใจโปรเจคและเริ่มต้นพัฒนาได้อย่างรวดเร็ว

---

## 🎯 โปรเจคนี้คืออะไร?

**THEN** คือระบบรับแจ้งความออนไลน์สำหรับกรณีถูกหลอกลวงทางอินเทอร์เน็ต โดยมีฟีเจอร์หลัก:

| ฟีเจอร์                     | รายละเอียด                                            |
| --------------------------- | ----------------------------------------------------- |
| 🤖 **AI สร้างเอกสาร**       | ผู้ใช้เล่าเหตุการณ์ → AI ช่วยสร้างใบแจ้งความอัตโนมัติ |
| 🔍 **ตรวจสอบบัญชีมิจฉาชีพ** | ค้นหาเลขบัญชี/เบอร์โทรที่มีประวัติหลอกลวง             |
| 💬 **AI ให้คำปรึกษา**       | AI chatbot ตอบคำถามเกี่ยวกับการหลอกลวงออนไลน์         |
| 📊 **ระบบ Admin**           | Dashboard สำหรับเจ้าหน้าที่ตรวจสอบและจัดการคดี        |

---

## 🛠 Technology Stack

```
Frontend Framework : Next.js 16 (App Router)
UI Library        : React 19
Styling           : TailwindCSS 4
UI Components     : shadcn/ui (Radix UI)
Icons             : Lucide React
Language          : TypeScript 5
```

> **หมายเหตุ**: ปัจจุบันเป็น Frontend-only (Mock data) ยังไม่มี Backend จริง

---

## 📁 โครงสร้างโฟลเดอร์

```
then-app/
├── app/                      # 📄 Pages (Next.js App Router)
│   ├── page.tsx              #    หน้าแรก (Landing Page)
│   ├── layout.tsx            #    Root Layout
│   ├── globals.css           #    Global Styles
│   ├── login/                #    🔐 หน้าเข้าสู่ระบบ (OTP)
│   ├── report/               #    📝 ระบบสร้างเอกสารแจ้งความ
│   ├── ai-chat/              #    💬 AI ให้คำปรึกษา
│   ├── consult/              #    👤 ปรึกษาเจ้าหน้าที่
│   └── admin/                #    ⚙️ ระบบหลังบ้านสำหรับ Admin
│       ├── page.tsx          #       Dashboard
│       ├── reports/          #       จัดการรายงาน
│       └── fraud-list/       #       จัดการบัญชีมิจฉาชีพ
│
├── components/               # 🧩 Reusable Components
│   ├── navbar.tsx            #    Navigation Bar
│   ├── footer.tsx            #    Footer
│   ├── hero-section.tsx      #    Hero Section หน้าแรก
│   ├── fraud-check.tsx       #    ฟอร์มตรวจสอบบัญชี
│   └── ui/                   #    shadcn/ui Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/                      # 🔧 Utilities & Services
│   ├── types.ts              #    TypeScript Types/Interfaces
│   ├── mock-data.ts          #    ข้อมูลจำลอง
│   ├── ai-service.ts         #    AI Response Logic (Mock)
│   ├── auth-context.tsx      #    Authentication Context
│   └── utils.ts              #    Utility Functions
│
└── public/                   # 📦 Static Assets
```

---

## 🚀 การเริ่มต้นพัฒนา

### 1. ติดตั้ง Dependencies

```bash
cd then-app
npm install
```

### 2. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### 3. คำสั่งอื่นๆ

| คำสั่ง          | การใช้งาน             |
| --------------- | --------------------- |
| `npm run dev`   | รัน Dev Server        |
| `npm run build` | Build Production      |
| `npm run start` | รัน Production Server |
| `npm run lint`  | ตรวจสอบ Code Style    |

---

## 🗺 Routes Overview

| Path                | หน้า                   | ต้อง Login? |
| ------------------- | ---------------------- | ----------- |
| `/`                 | หน้าแรก + ตรวจสอบบัญชี | ❌          |
| `/login`            | เข้าสู่ระบบ (OTP)      | ❌          |
| `/report`           | สร้างเอกสารแจ้งความ    | ✅          |
| `/ai-chat`          | AI ให้คำปรึกษา         | ❌          |
| `/consult`          | ปรึกษาเจ้าหน้าที่      | ❌          |
| `/admin`            | Admin Dashboard        | ✅ (Admin)  |
| `/admin/reports`    | จัดการรายงาน           | ✅ (Admin)  |
| `/admin/fraud-list` | จัดการบัญชีมิจฉาชีพ    | ✅ (Admin)  |

---

## 📌 สิ่งสำคัญที่ควรรู้

### Authentication (Mock)

- ระบบ Login ใช้ OTP จำลอง
- **OTP สำหรับทดสอบ**: `123456`
- ดูโค้ดที่ `lib/auth-context.tsx`

### AI Service (Mock)

- AI ตอบคำถามเป็น Mock response ตาม keyword
- ไม่ได้เชื่อมต่อ LLM จริง
- ดูโค้ดที่ `lib/ai-service.ts`

### ข้อมูลจำลอง

- ข้อมูลบัญชีมิจฉาชีพ, รายงาน, สถิติ ทั้งหมดเป็น Mock
- ดูโค้ดที่ `lib/mock-data.ts`

### Theme & Styling

- ใช้ CSS Variables สำหรับ Theme
- รองรับ Dark Mode
- สีหลัก: Gradient สีน้ำเงิน
- ดูที่ `app/globals.css`

---

## 🔑 Types ที่สำคัญ

ดูรายละเอียดที่ `lib/types.ts`:

```typescript
// บัญชีมิจฉาชีพ
interface FraudAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  reportCount: number;
  totalDamage: number;
  status: "confirmed" | "pending" | "investigating";
}

// รายงาน/คดี
interface Report {
  id: string;
  caseNumber: string;
  reporterName: string;
  incidentDetails: string;
  damageAmount: number;
  status: "pending" | "in_progress" | "completed" | "rejected";
}
```

---

## 💡 Tips สำหรับนักพัฒนา

1. **ใช้ shadcn/ui** - Component พร้อมใช้อยู่ใน `components/ui/`
2. **ดู Mock Data** - ช่วยให้เข้าใจ Data Structure
3. **ดู types.ts** - เป็น Source of Truth ของ Data Types
4. **ใช้ Lucide Icons** - ดู https://lucide.dev/icons

---

## 🎨 Design Guidelines

- **Font**: Geist (Next.js default)
- **สีหลัก**: Sky Blue Gradient
- **Border Radius**: ใช้ค่าจาก TailwindCSS
- **Spacing**: ใช้ Scale ของ TailwindCSS (4, 8, 12, 16, 24, 32...)

---

## 🚧 สิ่งที่ต้องทำต่อ (TODO)

- [ ] เชื่อมต่อ Backend API จริง
- [ ] ใช้ LLM จริงสำหรับ AI Service
- [ ] เพิ่มระบบ Authentication จริง (เช่น OTP ผ่าน SMS)
- [ ] เพิ่ม Unit Tests
- [ ] เพิ่มระบบจัดการไฟล์หลักฐาน (Upload)
- [ ] เพิ่ม LINE Bot Integration

---

## 📞 ต้องการความช่วยเหลือ?

หากมีข้อสงสัย สามารถติดต่อทีมพัฒนาได้เลย! 🙌

---

_เอกสารนี้อัปเดตล่าสุด: ธันวาคม 2567_
