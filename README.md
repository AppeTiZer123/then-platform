# THEN Platform — ระบบรับแจ้งเหตุและป้องกันการโกงออนไลน์

> **THEN Platform** คือแพลตฟอร์มดิจิทัลที่ช่วยให้ประชาชนแจ้งเหตุการโกงออนไลน์, ค้นหาบัญชีที่ต้องสงสัย, ปรึกษา AI และรับ PDF รายงานพร้อมส่งตำรวจ

---

## สารบัญ (Table of Contents)

1. [ภาพรวมโปรเจค](#1-ภาพรวมโปรเจค)
2. [Tech Stack](#2-tech-stack)
3. [โครงสร้างโฟลเดอร์](#3-โครงสร้างโฟลเดอร์)
4. [ฐานข้อมูล (Database Schema)](#4-ฐานข้อมูล-database-schema)
5. [ระบบ Authentication (OTP Login)](#5-ระบบ-authentication-otp-login)
6. [ฟีเจอร์หลัก](#6-ฟีเจอร์หลัก)
   - [6.1 การสร้างรายงาน (Report Creation)](#61-การสร้างรายงาน-report-creation)
   - [6.2 AI Chat & ค้นหาบัญชีโกง](#62-ai-chat--ค้นหาบัญชีโกง)
   - [6.3 สร้าง PDF รายงาน](#63-สร้าง-pdf-รายงาน)
   - [6.4 Admin Dashboard](#64-admin-dashboard)
   - [6.5 ระบบ Consultation](#65-ระบบ-consultation)
7. [API Endpoints](#7-api-endpoints)
8. [Middleware & Route Protection](#8-middleware--route-protection)
9. [Environment Variables](#9-environment-variables)
10. [การติดตั้งและรันโปรเจค](#10-การติดตั้งและรันโปรเจค)

---

## 1. ภาพรวมโปรเจค

THEN Platform แก้ปัญหาการโกงออนไลน์ผ่าน **4 ขั้นตอนหลัก**:

```
ผู้ใช้เล่าเรื่อง  →  AI สกัดข้อมูล  →  บันทึกฐานข้อมูล  →  สร้าง PDF รายงาน
```

**กลุ่มผู้ใช้งาน:**
- **ประชาชน (user)** — แจ้งเหตุ, ค้นหาบัญชีโกง, ปรึกษา AI
- **เจ้าหน้าที่ (officer)** — รับมอบหมายคดี, ติดตามคดี
- **ผู้ดูแลระบบ (admin)** — จัดการทุกอย่างในระบบ

---

## 2. Tech Stack

| ชั้น | เทคโนโลยี | เวอร์ชัน | บทบาท |
|------|-----------|---------|-------|
| **Framework** | Next.js (App Router) | 16.0.8 | Full-stack React framework |
| **Language** | TypeScript | 5 | Type safety ทั้งโปรเจค |
| **Database** | PostgreSQL (Supabase) | — | เก็บข้อมูลทั้งหมด |
| **ORM** | Drizzle ORM | 0.45.1 | Query builder + migrations |
| **Auth** | NextAuth v5 (beta) | 5.0.0-beta.30 | JWT session + OTP login |
| **AI/LLM** | Google Gemini (via Vercel AI SDK) | gemini-3.1-flash-lite | สกัดข้อมูล + chatbot |
| **UI Components** | shadcn/ui + Radix UI | — | Component library |
| **CSS** | Tailwind CSS | v4 | Utility-first styling |
| **Icons** | lucide-react | 0.559.0 | Icon set |
| **PDF** | @react-pdf/renderer | 4.3.2 | สร้าง PDF ภาษาไทย |
| **File Storage** | Supabase Storage | — | เก็บไฟล์หลักฐาน |
| **SMS** | Thaibulk SMS API | — | ส่ง OTP ผ่าน SMS |
| **Validation** | Zod | 4.3.6 | Schema validation |

---

## 3. โครงสร้างโฟลเดอร์

```
then-platform/
│
├── app/                          # Next.js App Router (pages + API routes)
│   ├── page.tsx                  # หน้า Landing Page
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── globals.css               # Tailwind global styles
│   │
│   ├── login/
│   │   └── page.tsx              # หน้าล็อกอินด้วย OTP (เบอร์โทรศัพท์)
│   │
│   ├── complete-profile/
│   │   └── page.tsx              # กรอกข้อมูลโปรไฟล์หลังสมัครครั้งแรก
│   │
│   ├── report/
│   │   ├── page.tsx              # สร้างรายงานแจ้งเหตุ (multi-step wizard)
│   │   ├── track/page.tsx        # ติดตามสถานะคดีด้วยเลขคดี
│   │   └── manual/page.tsx       # ทดสอบ PDF generation
│   │
│   ├── ai-chat/
│   │   └── page.tsx              # AI Chatbot ค้นหาบัญชีโกง + ปรึกษา
│   │
│   ├── consult/
│   │   └── page.tsx              # ส่งคำถามปรึกษาเจ้าหน้าที่
│   │
│   ├── settings/
│   │   └── page.tsx              # ตั้งค่าบัญชีผู้ใช้
│   │
│   ├── unauthorized/
│   │   └── page.tsx              # หน้า Access Denied
│   │
│   ├── admin/                    # Admin Panel (role: admin เท่านั้น)
│   │   ├── page.tsx              # Dashboard สรุปสถิติ
│   │   ├── reports/page.tsx      # จัดการรายงานทั้งหมด
│   │   ├── fraud-list/page.tsx   # ฐานข้อมูลบัญชีโกง
│   │   ├── consults/page.tsx     # คิวการปรึกษา
│   │   └── settings/page.tsx     # จัดการ officers, users, ระบบ
│   │
│   └── api/                      # REST API Routes
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── reports/              # CRUD รายงาน + PDF
│       ├── admin/                # Admin operations
│       ├── ai/                   # AI extraction
│       ├── consultations/        # Consultation endpoints
│       ├── chat/route.ts         # AI streaming chat
│       └── pdf/generate/         # PDF generation
│
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   ├── hero-section.tsx          # Landing page hero
│   ├── auth-session-provider.tsx # NextAuth SessionProvider wrapper
│   └── floating-consult-widget.tsx # ปุ่มปรึกษาลอยตัว
│
├── lib/                          # Business logic & utilities
│   ├── db/
│   │   ├── schema.ts             # Drizzle ORM schema (นิยาม tables ทั้งหมด)
│   │   ├── index.ts              # Database connection
│   │   └── repositories/        # Data Access Layer
│   │       ├── user.repo.ts      # CRUD users
│   │       ├── report.repo.ts    # CRUD reports
│   │       ├── fraud.repo.ts     # CRUD + search fraud accounts
│   │       ├── officer.repo.ts   # CRUD officers
│   │       ├── consultation.repo.ts
│   │       ├── evidence.repo.ts
│   │       └── index.ts          # Export ทั้งหมด
│   │
│   ├── actions/                  # Next.js Server Actions
│   │   ├── auth.ts               # requestOTP, verifyOTP
│   │   ├── user.ts               # getUser, updateUser
│   │   ├── reports.ts            # getReports, getReportById
│   │   └── fraud.ts              # searchFraud, getFraudAccounts
│   │
│   ├── pdf/
│   │   └── incident-report-template.tsx  # React-PDF template (ฟอร์มแจ้งความ)
│   │
│   ├── ai-service.ts             # Logic สำหรับ AI chat responses
│   ├── auth.ts                   # NextAuth configuration
│   ├── supabase.ts               # Supabase client (file storage)
│   ├── sms-service.ts            # ส่ง SMS ผ่าน Thaibulk API
│   ├── utils.ts                  # cn() helper สำหรับ classNames
│   ├── types.ts                  # TypeScript interfaces
│   └── mock-data.ts              # ข้อมูลตัวอย่างสำหรับ demo
│
├── types/                        # TypeScript type declarations
│   ├── next-auth.d.ts            # ขยาย NextAuth Session types
│   └── pdf-report.ts             # Types สำหรับ PDF form data
│
├── public/                       # Static assets
│   └── fonts/
│       ├── Sarabun-Regular.ttf   # ฟอนต์ภาษาไทย (สำหรับ PDF)
│       └── Sarabun-Bold.ttf
│
├── middleware.ts                 # Route protection + auth redirect
├── drizzle.config.ts             # Drizzle ORM configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 4. ฐานข้อมูล (Database Schema)

ฐานข้อมูลอยู่ใน **PostgreSQL** (Supabase) schema ชื่อ `then_app` กำหนดใน `lib/db/schema.ts`

### ตาราง users
เก็บข้อมูลผู้ใช้ทุกคนในระบบ
```
id            UUID (PK)
phone         VARCHAR unique        ← เบอร์โทรสำหรับ OTP login
name          VARCHAR
email         VARCHAR
idCardEncrypted TEXT               ← เลขบัตรประชาชน (เข้ารหัส)
address       TEXT
isVerified    BOOLEAN default false
role          VARCHAR default 'user' ← 'user' | 'admin' | 'officer'
createdAt     TIMESTAMP
updatedAt     TIMESTAMP
```

### ตาราง otp_verifications
เก็บ OTP ที่ส่งให้ผู้ใช้ (หมดอายุใน 5 นาที)
```
id          UUID (PK)
phone       VARCHAR
otpCodeHash VARCHAR  ← SHA-256 hash ของ OTP
expiresAt   TIMESTAMP
isUsed      BOOLEAN default false
createdAt   TIMESTAMP
```

### ตาราง fraud_accounts
ฐานข้อมูลบัญชีที่ถูกรายงานว่าโกง — หัวใจของระบบ
```
id              UUID (PK)
accountNumber   VARCHAR unique  ← เลขบัญชีธนาคาร
bankName        VARCHAR
accountName     VARCHAR
phoneNumber     VARCHAR
reportCount     INTEGER default 0   ← จำนวนครั้งที่ถูกรายงาน
totalDamage     DECIMAL(15,2)       ← ความเสียหายรวม (บาท)
status          VARCHAR             ← 'pending' | 'investigating' | 'confirmed'
idCardNumber    VARCHAR
lastReportedAt  TIMESTAMP
createdAt / updatedAt
```

### ตาราง officers
เจ้าหน้าที่ที่รับผิดชอบคดี
```
id         UUID (PK)
userId     UUID → users.id (FK)
rank       VARCHAR   ← ยศ เช่น พ.ต.อ.
department VARCHAR
isActive   BOOLEAN
createdAt  TIMESTAMP
```

### ตาราง reports
รายงานแต่ละคดีที่ประชาชนแจ้ง
```
id                    UUID (PK)
caseNumber            VARCHAR unique  ← รูปแบบ RPT-YYYY-NNNN-XXXXXX
reporterId            UUID → users.id
reporterName/Phone/Email VARCHAR
incidentDate          DATE
incidentDetails       TEXT
damageAmount          DECIMAL(15,2)
suspectFraudAccountId UUID → fraud_accounts.id
suspectPhone          VARCHAR
suspectSocialMedia    TEXT
status                VARCHAR  ← 'pending' | 'in_progress' | 'completed'
assignedOfficerId     UUID → officers.id
aiGeneratedDocument   JSONB    ← ข้อมูลที่ AI สกัดออกมาทั้งหมด
createdAt / updatedAt
```

### ตาราง report_evidence
ไฟล์หลักฐานแนบมากับรายงาน
```
id           UUID (PK)
reportId     UUID → reports.id (cascade delete)
fileUrl      TEXT     ← Supabase Storage URL
fileType     VARCHAR
originalName VARCHAR
fileSize     INTEGER
createdAt    TIMESTAMP
```

### ตาราง consultations & consultation_responses
ระบบส่งคำถาม-ตอบระหว่างผู้ใช้กับ admin
```
consultations:
  id, userId, userName, subject, message
  status: 'open' | 'answered' | 'closed'

consultation_responses:
  id, consultationId (cascade), responderId, responderName, message
```

### Relationships
```
users ──< reports (as reporter)
users ──< consultations
users ──< officers (1:1 profile)
officers ──< reports (as assignee)
fraud_accounts ──< reports (as suspect)
reports ──< report_evidence (cascade delete)
consultations ──< consultation_responses (cascade delete)
```

---

## 5. ระบบ Authentication (OTP Login)

ไม่มี password — ใช้ **OTP ผ่าน SMS** เท่านั้น

### ขั้นตอน
```
1. ผู้ใช้กรอกเบอร์โทร
        ↓
2. Server: สร้าง OTP 6 หลัก → hash (SHA-256) → บันทึกใน otp_verifications
        ↓
3. Thaibulk SMS API: ส่ง OTP ไปยังเบอร์โทร
        ↓
4. ผู้ใช้กรอก OTP ใน UI
        ↓
5. Server: hash OTP ที่รับมา → เปรียบเทียบกับ DB → ตรวจสอบว่ายังไม่หมดอายุ
        ↓
6. NextAuth: สร้าง JWT session (อายุ 7 วัน) พร้อมข้อมูล user
        ↓
7. Middleware: ถ้าผู้ใช้ยังไม่กรอกข้อมูล → redirect /complete-profile
```

### ไฟล์ที่เกี่ยวข้อง
- `lib/sms-service.ts` — เรียก Thaibulk API ส่ง SMS
- `lib/actions/auth.ts` — `requestOTP()`, `verifyOTP()`
- `lib/auth.ts` — NextAuth config, Credentials provider
- `middleware.ts` — ตรวจสอบ session, กำหนด redirect rules

---

## 6. ฟีเจอร์หลัก

### 6.1 การสร้างรายงาน (Report Creation)

ไฟล์: `app/report/page.tsx` — เป็น multi-step wizard มี 5 ขั้นตอน

```
ขั้นตอนที่ 1: กรอกข้อมูลผู้แจ้ง (ชื่อ, เบอร์, อีเมล)
        ↓
ขั้นตอนที่ 2: เล่าเรื่องราวเป็นภาษาพูด + แนบหลักฐาน
        ↓
ขั้นตอนที่ 3: AI สกัดข้อมูล (POST /api/ai/extract-incident)
              - ส่ง story + contact info → Gemini AI
              - AI คืน JSON ตาม Zod schema:
                • ข้อมูลผู้แจ้ง (ชื่อ, อายุ, เลขบัตร, เบอร์)
                • รายละเอียดเหตุการณ์ (วัน/เวลา, ประเภทความเสียหาย)
                • ข้อมูลผู้ต้องสงสัย (เลขบัญชี, ธนาคาร, เบอร์, โซเชียล)
        ↓
ขั้นตอนที่ 4: ผู้ใช้ตรวจสอบและยืนยันข้อมูล
        ↓
ขั้นตอนที่ 5: บันทึก (POST /api/reports)
              - สร้างเลขคดี: RPT-{YYYY}-{NNNN}-{UUID6}
              - upsert fraud_accounts (ถ้าเลขบัญชีซ้ำ → เพิ่ม reportCount)
              - บันทึก report พร้อม aiGeneratedDocument ใน JSONB
              - เชื่อม evidence files
```

**เลขคดี format:** `RPT-2025-0001-a1b2c3`
- Quick Report (จาก AI chat): `QR-2025-0001-a1b2c3`

### 6.2 AI Chat & ค้นหาบัญชีโกง

ไฟล์: `app/ai-chat/page.tsx`, `app/api/chat/route.ts`, `lib/ai-service.ts`

AI สามารถตอบได้สองแบบ:

**แบบที่ 1: ค้นหาบัญชีโกง**
```
ผู้ใช้พิมพ์: "ตรวจสอบ 123-4-56789-0" หรือ "เช็ค 0812345678"
        ↓
Regex สกัด account number / phone / ชื่อ
        ↓
fraud.repo.searchAll(query) — fuzzy search ใน DB
        ↓
คืนผลลัพธ์: สถานะบัญชี, จำนวนรายงาน, ความเสียหายรวม
```

**แบบที่ 2: สนทนาทั่วไปเกี่ยวกับการโกงออนไลน์**
```
ผู้ใช้พิมพ์: "ถูกโกงซื้อของออนไลน์ทำยังไงดี"
        ↓
Gemini AI ตอบแบบ streaming (real-time)
        ↓
แสดงผลทีละตัวอักษรใน UI
```

**Quick Report จาก Chat:**
- ผู้ใช้บอก "แจ้งบัญชีนี้" → แบบฟอร์มย่อ pop up
- ส่ง POST /api/reports ด้วยข้อมูลที่กรอก → ได้เลขคดี QR-XXXX

### 6.3 สร้าง PDF รายงาน

ไฟล์: `lib/pdf/incident-report-template.tsx`, `app/api/reports/[reportId]/pdf/route.ts`

```
GET /api/reports/{reportId}/pdf
        ↓
ดึงข้อมูล report จาก DB (รวม aiGeneratedDocument)
        ↓
ส่งข้อมูลเข้า React-PDF template
        ↓
Render เป็น PDF ภาษาไทย (ใช้ฟอนต์ Sarabun)
        ↓
ส่ง Response เป็น application/pdf
```

PDF มีรูปแบบเหมือน **แบบฟอร์มแจ้งความตำรวจ** ประกอบด้วย:
- ข้อมูลผู้แจ้ง (ชื่อ-นามสกุล, ที่อยู่, เลขบัตร)
- รายละเอียดเหตุการณ์
- ข้อมูลทรัพย์สินที่สูญเสีย
- ข้อมูลบัญชีผู้ต้องสงสัย
- เลขคดี & วันที่

### 6.4 Admin Dashboard

ไฟล์: `app/admin/` — ทุกหน้าต้องมี role `admin`

| หน้า | ฟังก์ชัน |
|------|----------|
| `/admin` | สถิติภาพรวม: จำนวนรายงาน, บัญชีโกง, ความเสียหายรวม |
| `/admin/reports` | ดูรายงานทั้งหมด, กรองสถานะ, มอบหมาย officer |
| `/admin/fraud-list` | จัดการฐานข้อมูลบัญชีโกง (CRUD + เปลี่ยนสถานะ) |
| `/admin/consults` | ดูคำถามผู้ใช้, ตอบกลับ |
| `/admin/settings` | จัดการ officers, users, ตั้งค่าระบบ |

### 6.5 ระบบ Consultation

```
ผู้ใช้กด floating widget หรือไป /consult
        ↓
กรอก subject + message
        ↓
POST /api/consultations → บันทึกใน DB (status: open)
        ↓
Admin เห็นใน /admin/consults
        ↓
Admin กด Reply → POST /api/admin/consultations/{id}/reply
        ↓
บันทึกใน consultation_responses
```

---

## 7. API Endpoints

### Public (ไม่ต้อง login)
| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/auth/[...nextauth]` | NextAuth handler (signin/signout) |
| POST | `/api/chat` | AI chat streaming |
| POST | `/api/ai/extract-incident` | AI สกัดข้อมูลจากเรื่องราว |

### Protected (ต้อง login)
| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/reports` | สร้างรายงาน |
| GET | `/api/reports/mine` | ดูรายงานของตัวเอง |
| GET | `/api/reports/track` | ติดตามคดีด้วยเลขคดี |
| POST | `/api/reports/evidence` | อัปโหลดหลักฐาน |
| GET | `/api/reports/[id]/pdf` | ดาวน์โหลด PDF |
| POST | `/api/consultations` | ส่งคำถามปรึกษา |
| GET | `/api/consultations` | ดูคำถามของตัวเอง |

### Admin Only (role: admin)
| Method | Path | หน้าที่ |
|--------|------|--------|
| GET | `/api/admin/reports` | รายงานทั้งหมด (paginated) |
| GET/POST | `/api/admin/reports/[id]` | ดู/อัปเดตรายงาน |
| GET/POST/PUT/DELETE | `/api/admin/users/[id]` | จัดการ users |
| GET/POST/PUT/DELETE | `/api/admin/officers/[id]` | จัดการ officers |
| GET | `/api/admin/consultations` | ดูคำถามทั้งหมด |
| POST | `/api/admin/consultations/[id]/reply` | ตอบคำถาม |
| POST | `/api/admin/import` | นำเข้าข้อมูล |
| POST | `/api/admin/backup` | สำรองข้อมูล |

---

## 8. Middleware & Route Protection

ไฟล์: `middleware.ts`

```
ทุก request เข้า → ตรวจสอบ NextAuth session
        ↓
ถ้าไม่มี session + path ที่ต้องการ auth → redirect /login
        ↓
ถ้ามี session แต่ยังไม่กรอก profile → redirect /complete-profile
        ↓
ถ้าพยายามเข้า /admin แต่ role ≠ admin → redirect /unauthorized
        ↓
ผ่านทุกเงื่อนไข → อนุญาตให้เข้าถึง
```

**Public paths** (ไม่ redirect): `/`, `/login`, `/unauthorized`, `/api/auth/*`

---

## 9. Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจค:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# NextAuth
AUTH_SECRET=your-secret-key-min-32-chars

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Supabase (File Storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Thaibulk SMS
THAIBULK_API_KEY=your-thaibulk-key
THAIBULK_SENDER=THEN

# App URL
NEXTAUTH_URL=http://localhost:3000
```

---

## 10. การติดตั้งและรันโปรเจค

### ความต้องการ
- Node.js 18+
- PostgreSQL database (แนะนำ Supabase)
- บัญชี Google AI Studio (สำหรับ Gemini API key)
- บัญชี Thaibulk SMS (สำหรับส่ง OTP)

### ขั้นตอน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้าง .env.local แล้วกรอก environment variables

# 3. สร้าง database tables
npx drizzle-kit push

# 4. รันในโหมด development
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### Scripts อื่นๆ
```bash
npm run build          # Build สำหรับ production
npm run start          # รัน production build
npm run lint           # ตรวจสอบ code style ด้วย ESLint
npx drizzle-kit studio # เปิด Drizzle Studio ดูฐานข้อมูล
```

---

## Deploy บน Vercel

```bash
# ผ่าน Vercel CLI
npx vercel

# หรือเชื่อม GitHub repo กับ Vercel dashboard
# แล้วกรอก environment variables ใน Project Settings → Environment Variables
```

ดูรายละเอียดเพิ่มเติม: [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
