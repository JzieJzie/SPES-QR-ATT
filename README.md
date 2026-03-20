# SPES QR Attendance (Santa Rosa)

Production-oriented, fully online, mobile-first QR attendance system for SPES beneficiaries.

## Tech Stack

- Frontend: Vite + React + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (Postgres, Auth, Storage, RPC)
- Scanner: html5-qrcode (manual scan, no auto-start)
- Validation: React Hook Form + Zod
- Data: @supabase/supabase-js + TanStack Query
- File import/export: Papa Parse + SheetJS + ExcelJS
- QR generation: qrcode
- Date/time: date-fns + date-fns-tz
- Icons: lucide-react

## File Tree

```text
.
|-- .env.example
|-- README.md
|-- postcss.config.js
|-- tailwind.config.ts
|-- supabase/
|   |-- migrations/
|   |   `-- 20260320_init.sql
|   |-- seed.sql
|   `-- functions/
|       `-- record-scan/
|           `-- index.ts
`-- src/
    |-- app/
    |   |-- App.tsx
    |   |-- providers.tsx
    |   |-- query-client.ts
    |   `-- router.tsx
    |-- components/
    |   |-- shared/
    |   |   |-- AppLayout.tsx
    |   |   `-- ProtectedRoute.tsx
    |   `-- ui/
    |       |-- Badge.tsx
    |       |-- Button.tsx
    |       |-- Card.tsx
    |       |-- Input.tsx
    |       |-- Modal.tsx
    |       `-- Table.tsx
    |-- features/
    |   |-- attendance/api.ts
    |   |-- beneficiaries/
    |   |   |-- api.ts
    |   |   |-- ArchiveConfirmDialog.tsx
    |   |   `-- BeneficiaryQrPreview.tsx
    |   |-- imports/
    |   |   |-- api.ts
    |   |   `-- ImportPreviewTable.tsx
    |   |-- scanner/
    |   |   |-- api.ts
    |   |   |-- AttendanceResultCard.tsx
    |   |   `-- ScannerPanel.tsx
    |   `-- users/api.ts
    |-- hooks/useAuth.ts
    |-- lib/
    |   |-- constants/attendance.ts
    |   |-- supabase/client.ts
    |   |-- utils/
    |   |   |-- attendance-classifier.ts
    |   |   |-- cn.ts
    |   |   |-- daily-summary.ts
    |   |   |-- export-formatting.ts
    |   |   |-- id-generator.ts
    |   |   |-- import-normalization.ts
    |   |   `-- time.ts
    |   `-- validators/import.ts
    |-- pages/
    |   |-- ArchivedBeneficiariesPage.tsx
    |   |-- BeneficiariesPage.tsx
    |   |-- BeneficiaryDetailsPage.tsx
    |   |-- DailyAttendancePage.tsx
    |   |-- DashboardPage.tsx
    |   |-- ImportMasterlistPage.tsx
    |   |-- LoginPage.tsx
    |   |-- ReportsPage.tsx
    |   |-- ScannerPage.tsx
    |   |-- SettingsPage.tsx
    |   `-- UserManagementPage.tsx
    |-- types/
    |   |-- domain.ts
    |   `-- supabase.ts
    |-- index.css
    `-- main.tsx
```

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create environment file.

```bash
cp .env.example .env
```

3. Fill the values in .env.

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

4. Apply database migration in Supabase SQL Editor.

- Run supabase/migrations/20260320_init.sql
- Run supabase/seed.sql (optional sample data)

5. Start development server.

```bash
npm run dev:8080:clean
```

6. Build for production.

```bash
npm run build
```

## Login Credentials

There is no hard-coded default email/password in this repository.

Create a user in Supabase first:

1. Go to Supabase Dashboard -> Authentication -> Users -> Add user
2. Set your email and password
3. Use those exact credentials on the app Login page

To make that user an admin, run this SQL in Supabase SQL Editor:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
    and u.email = 'your-email@example.com';
```

## Attendance Rules Implemented

- AM In: 06:00:00 to 09:00:00, late from 07:21:00
- PM In: 12:00:00 to 15:00:00, late from 13:21:00
- AM Out early if before 11:50:00, cutoff at 12:30:00
- PM Out early if before 16:50:00, cutoff at 18:00:00
- Invalid windows are recorded as invalid_window (manual adjustment required)
- Duplicate protection within 10 seconds
- Extra punches recorded using is_extra_punch and punch_sequence
- Daily summary is recomputed from raw events using recompute_attendance_daily
- All date boundaries and reporting use Asia/Manila

## RLS and Security

- Supabase Auth is required
- Role model: admin, scanner
- Admin handles imports, user roles, archive/restore, edits, reports
- Scanner can scan and view attendance
- Service role key is never used in frontend
- QR storage bucket is private with policies

## Deploy Notes

### Frontend

- Recommended: Vercel or Netlify
- Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in deployment env vars
- Build command: npm run build
- Output directory: dist

### Supabase

- Provision project (Auth, Database, Storage)
- Run migration SQL and seed SQL
- Create admin user in Auth then update profiles.role to admin
- Deploy optional edge function:

```bash
supabase functions deploy record-scan
```

## Assumptions

- Beneficiary IDs are generated in database sequence for concurrency safety
- QR image generation and upload happen after beneficiary insert
- Scanner is fully online; no offline queueing is implemented
- Manual adjustments are expected to be admin-driven by editing attendance events and forcing recompute

## Future Improvements

- Add dedicated manual adjustment page with reason codes and approvals
- Add city-wide multi-program partitioning (city_id/program_id) for federation
- Add audit log browsing and diff rendering in admin UI
- Add stronger automated tests (unit + integration + RLS smoke tests)
- Add biometric/device trust metadata for anti-spoofing
