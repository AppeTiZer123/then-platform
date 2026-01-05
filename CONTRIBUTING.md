# 📘 คู่มือสำหรับนักพัฒนา - THEN Platform

ยินดีต้อนรับเข้าสู่ทีมพัฒนา **THEN** (Thai Electronics Fraud Helpline Network)! 🎉

เอกสารนี้จะช่วยให้คุณเข้าใจโปรเจคและเริ่มต้นพัฒนาได้อย่างรวดเร็ว

---

## 🎯 โปรเจคนี้คืออะไร?

**THEN** คือแพลตฟอร์มช่วยเหลือผู้เสียหายจากการหลอกลวงทางอินเทอร์เน็ต โดยมีฟีเจอร์หลัก:

| ฟีเจอร์                     | รายละเอียด                                        |
| --------------------------- | ------------------------------------------------- |
| 🤖 **AI สร้างเอกสาร**       | ผู้ใช้เล่าเหตุการณ์ → AI ช่วยสร้างเอกสารแจ้งความ  |
| 🔍 **ตรวจสอบบัญชีมิจฉาชีพ** | ค้นหาเลขบัญชี/เบอร์โทรที่มีประวัติหลอกลวง         |
| 💬 **AI ให้คำปรึกษา**       | AI chatbot ตอบคำถามเกี่ยวกับการหลอกลวงออนไลน์     |
| 📊 **ระบบ Admin**           | Dashboard สำหรับเจ้าหน้าที่ตรวจสอบและจัดการรายงาน |
| ⚙️ **ระบบตั้งค่าโปรไฟล์**   | ผู้ใช้สามารถจัดการข้อมูลส่วนตัวและการตั้งค่าต่างๆ |

---

## 🛠 Technology Stack

### Frontend

```
Framework         : Next.js 16 (App Router)
UI Library        : React 19
Styling           : TailwindCSS 4
UI Components     : shadcn/ui (Radix UI)
Icons             : Lucide React
Language          : TypeScript 5
```

### Backend / Database

```
ORM               : Drizzle ORM
Database          : PostgreSQL
Authentication    : NextAuth.js 5 (Beta)
```

### DevTools

```
Bundler           : Turbopack (via Next.js)
Linting           : ESLint 9
DB Migrations     : Drizzle Kit
```

---

## 📁 โครงสร้างโฟลเดอร์

```
then-platform/
├── app/                          # 📄 Pages (Next.js App Router)
│   ├── page.tsx                  #    หน้าแรก (Landing Page)
│   ├── layout.tsx                #    Root Layout
│   ├── globals.css               #    Global Styles
│   ├── login/                    #    🔐 หน้าเข้าสู่ระบบ (OTP)
│   ├── complete-profile/         #    📋 กรอกข้อมูลโปรไฟล์ (ผู้ใช้ใหม่)
│   ├── report/                   #    📝 ระบบสร้างเอกสารแจ้งความ
│   ├── ai-chat/                  #    💬 AI ให้คำปรึกษา
│   ├── consult/                  #    👤 ปรึกษาเจ้าหน้าที่
│   ├── settings/                 #    ⚙️ ตั้งค่าโปรไฟล์ผู้ใช้
│   │   └── components/           #       Components เฉพาะหน้า Settings
│   ├── unauthorized/             #    🚫 หน้าแจ้งเตือน Unauthorized
│   ├── admin/                    #    🛡️ ระบบหลังบ้านสำหรับ Admin
│   │   ├── page.tsx              #       Dashboard
│   │   ├── layout.tsx            #       Admin Layout
│   │   ├── reports/              #       จัดการรายงาน
│   │   ├── fraud-list/           #       จัดการบัญชีมิจฉาชีพ
│   │   └── settings/             #       ตั้งค่าระบบ Admin
│   └── api/                      #    🔌 API Routes
│       ├── auth/                 #       NextAuth.js handlers
│       └── admin/                #       Admin API endpoints
│
├── components/                   # 🧩 Reusable Components
│   ├── navbar.tsx                #    Navigation Bar
│   ├── footer.tsx                #    Footer
│   ├── hero-section.tsx          #    Hero Section หน้าแรก
│   ├── fraud-check.tsx           #    ฟอร์มตรวจสอบบัญชี
│   ├── auth-session-provider.tsx #    NextAuth Session Provider
│   └── ui/                       #    shadcn/ui Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       └── separator.tsx
│
├── lib/                          # 🔧 Utilities & Services
│   ├── types.ts                  #    TypeScript Types/Interfaces
│   ├── mock-data.ts              #    ข้อมูลจำลอง
│   ├── ai-service.ts             #    AI Response Logic (Mock)
│   ├── auth.ts                   #    NextAuth Configuration
│   ├── auth-context.tsx          #    Legacy Auth Context
│   ├── otp-store.ts              #    OTP Management
│   ├── utils.ts                  #    Utility Functions (cn, etc.)
│   ├── db/                       #    Database
│   │   ├── index.ts              #       DB Connection
│   │   └── schema.ts             #       Drizzle Schema
│   └── actions/                  #    Server Actions
│       ├── auth.ts               #       Authentication actions
│       └── user.ts               #       User-related actions
│
├── types/                        # 📦 Type Declarations
│   └── next-auth.d.ts            #    NextAuth type extensions
│
├── middleware.ts                 # 🛡️ Route Protection Middleware
├── drizzle.config.ts             # ⚙️ Drizzle Kit Configuration
└── public/                       # 📦 Static Assets
```

---

## 🚀 การเริ่มต้นพัฒนา

### 1. ติดตั้ง Dependencies

```bash
cd then-platform
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และกำหนดค่า:

```bash
# Database
DATABASE_URL=postgres://user:password@host:5432/then_app

# NextAuth
AUTH_SECRET=your-secret-key
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### 4. คำสั่งอื่นๆ

| คำสั่ง          | การใช้งาน             |
| --------------- | --------------------- |
| `npm run dev`   | รัน Dev Server        |
| `npm run build` | Build Production      |
| `npm run start` | รัน Production Server |
| `npm run lint`  | ตรวจสอบ Code Style    |

### 5. Database Commands (Drizzle)

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Open Drizzle Studio (Database GUI)
npx drizzle-kit studio
```

---

## 🗺 Routes Overview

| Path                | หน้า                   | ต้อง Login? |
| ------------------- | ---------------------- | ----------- |
| `/`                 | หน้าแรก + ตรวจสอบบัญชี | ❌          |
| `/login`            | เข้าสู่ระบบ (OTP)      | ❌          |
| `/complete-profile` | กรอกข้อมูลโปรไฟล์      | ✅          |
| `/report`           | สร้างเอกสารแจ้งความ    | ✅          |
| `/ai-chat`          | AI ให้คำปรึกษา         | ❌          |
| `/consult`          | ปรึกษาเจ้าหน้าที่      | ❌          |
| `/settings`         | ตั้งค่าโปรไฟล์         | ✅          |
| `/unauthorized`     | หน้าแจ้ง Unauthorized  | ❌          |
| `/admin`            | Admin Dashboard        | ✅ (Admin)  |
| `/admin/reports`    | จัดการรายงาน           | ✅ (Admin)  |
| `/admin/fraud-list` | จัดการบัญชีมิจฉาชีพ    | ✅ (Admin)  |
| `/admin/settings`   | ตั้งค่าระบบ Admin      | ✅ (Admin)  |

---

## 📌 สิ่งสำคัญที่ควรรู้

### Authentication (NextAuth.js)

- ใช้ NextAuth.js v5 (Beta) สำหรับ Authentication
- Login ด้วย OTP ผ่านเบอร์โทรศัพท์
- **OTP สำหรับทดสอบ**: `123456`
- ดูโค้ดที่ `lib/auth.ts` และ `lib/actions/auth.ts`
- Session Provider: `components/auth-session-provider.tsx`
- Route Protection: `middleware.ts`

### Database Schema

ใช้ Drizzle ORM กับ PostgreSQL โดยมี Tables หลัก:

| Table                    | คำอธิบาย            |
| ------------------------ | ------------------- |
| `users`                  | ข้อมูลผู้ใช้        |
| `otp_verifications`      | OTP ที่ส่งไป        |
| `officers`               | ข้อมูลเจ้าหน้าที่   |
| `fraud_accounts`         | บัญชีมิจฉาชีพ       |
| `reports`                | รายงาน/เคส          |
| `report_evidence`        | หลักฐานประกอบรายงาน |
| `consultations`          | คำขอปรึกษา          |
| `consultation_responses` | คำตอบจากเจ้าหน้าที่ |

ดู Schema ที่ `lib/db/schema.ts`

### AI Service (Mock)

- AI ตอบคำถามเป็น Mock response ตาม keyword
- ยังไม่ได้เชื่อมต่อ LLM จริง
- ดูโค้ดที่ `lib/ai-service.ts`

### Mock Data

- ข้อมูลบัญชีมิจฉาชีพ, รายงาน, สถิติ บางส่วนยังเป็น Mock
- ดูโค้ดที่ `lib/mock-data.ts`

### Theme & Styling

- ใช้ CSS Variables สำหรับ Theme
- รองรับ Dark Mode
- สีหลัก: Gradient สีน้ำเงิน
- ดูที่ `app/globals.css`

---

## 🔑 Types ที่สำคัญ

### Frontend Types (`lib/types.ts`)

```typescript
// บัญชีมิจฉาชีพ
interface FraudAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName?: string;
  phoneNumber?: string;
  reportCount: number;
  totalDamage: number;
  lastReportedAt: string;
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

// ข้อมูลฟอร์มรายงาน
interface ReportFormData {
  fullName: string;
  idCard: string;
  phone: string;
  incidentDate: string;
  damageAmount: number;
  incidentDetails: string;
  // ... และอื่นๆ
}
```

### Database Types (`lib/db/schema.ts`)

Types ถูก infer จาก Drizzle Schema โดยอัตโนมัติ:

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FraudAccount = typeof fraudAccounts.$inferSelect;
export type Report = typeof reports.$inferSelect;
```

---

## 💡 Tips สำหรับนักพัฒนา

1. **ใช้ shadcn/ui** - Component พร้อมใช้อยู่ใน `components/ui/`
2. **ดู Schema** - `lib/db/schema.ts` คือ Source of Truth ของ Database
3. **ดู types.ts** - สำหรับ Frontend types ที่ใช้กับ Mock data
4. **ใช้ Lucide Icons** - ดู https://lucide.dev/icons
5. **Server Actions** - ใช้สำหรับ mutations ที่ต้อง interact กับ DB (`lib/actions/`)
6. **Middleware** - ตรวจสอบ routes ที่ต้อง protect ใน `middleware.ts`

---

## 🎨 Design Guidelines

- **Font**: Geist (Next.js default)
- **สีหลัก**: Sky Blue Gradient
- **Border Radius**: ใช้ค่าจาก TailwindCSS
- **Spacing**: ใช้ Scale ของ TailwindCSS (4, 8, 12, 16, 24, 32...)

---

## 🚧 สิ่งที่ต้องทำต่อ (TODO)

- [ ] เชื่อมต่อ AI/LLM จริงสำหรับ AI Service
- [ ] เพิ่มระบบ OTP ผ่าน SMS จริง
- [ ] เพิ่ม Unit Tests
- [ ] เพิ่มระบบ Upload หลักฐาน (Images/Files)
- [ ] เพิ่ม LINE Bot Integration
- [ ] เพิ่มระบบ Notification

---

## 📞 ต้องการความช่วยเหลือ?

หากมีข้อสงสัย สามารถติดต่อทีมพัฒนาได้เลย! 🙌

---

_เอกสารนี้อัปเดตล่าสุด: ธันวาคม 2567_
