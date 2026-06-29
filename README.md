# AAPICO AI Judge — Full-Stack Project

ระบบประเมินผลการแข่งขัน AI Innovation สำหรับกลุ่มบริษัท AAPICO

## Project Structure

```
ai-competition/
├── frontend/           React + Vite + TypeScript
│   └── src/
│       ├── components/ Header, ScoringForm, CriteriaCard, ProjectPanel, Dashboard, SaveModal
│       ├── constants/  data.ts (AAPICO criteria & rubrics)
│       ├── hooks/      useEvaluations.ts (API integration)
│       ├── types/      index.ts (TypeScript types)
│       └── App.tsx
│
├── backend/            Node.js + Express REST API
│   └── src/
│       ├── controllers/ evaluationController, projectController
│       ├── db/          database.ts (sql.js), migrations.ts
│       ├── middleware/  errorHandler.ts
│       ├── routes/      projects.ts, evaluations.ts
│       └── app.ts
│
└── README.md
```

## Prerequisites

- Node.js v18+
- npm

## การรันโปรเจกต์ (Running the Project)

### 1. การเปิดใช้งาน (แบบรันพร้อมกัน)

โปรเจกต์นี้ตั้งค่าให้สามารถเปิดใช้งานทั้งฝั่ง Backend และ Frontend ได้พร้อมกันจากโฟลเดอร์หลัก (Root folder)

```bash
# หากเพิ่งโคลนโปรเจกต์ครั้งแรก ให้ติดตั้ง dependencies ทั้งหมดก่อน:
npm run install:all

# เริ่มการทำงานของระบบ:
npm run dev
```

เมื่อระบบทำงาน:
- 🚀 **Frontend (หน้าเว็บ):** http://localhost:5173
- 🔌 **Backend (API):** http://localhost:3001

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | ดึงรายการ projects ทั้งหมด |
| GET | `/api/projects/:id` | ดึง project รายบุคคล |
| GET | `/api/evaluations` | ดึง evaluations ทั้งหมด |
| GET | `/api/evaluations/:projectId` | ดึง evaluation รายโครงการ |
| POST | `/api/evaluations` | บันทึก/อัปเดต evaluation |
| DELETE | `/api/evaluations/:projectId` | ลบ evaluation |

## Database

- ใช้ **sql.js** (Pure JavaScript SQLite) — ไม่ต้องติดตั้ง C++ build tools
- ไฟล์ DB จะถูกสร้างอัตโนมัติที่ `backend/data/aapico_judge.db`
- Seed data: 13 บริษัท × 2 โปรเจกต์ = 26 โปรเจกต์

## Scoring Criteria

| Criteria | Max Score |
|----------|-----------|
| ผลกระทบต่อธุรกิจ | 30 |
| ความเป็นไปได้ในการดำเนินการ | 25 |
| นวัตกรรมและความคิดสร้างสรรค์ | 20 |
| ความชัดเจนของการนำเสนอ | 15 |
| ความสามารถในการขยายผล | 10 |
| **รวม** | **100** |
