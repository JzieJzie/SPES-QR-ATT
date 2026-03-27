# SPES QR Attendance - Project Documentation

## 1. Project Overview

SPES QR Attendance is a web-based attendance management system designed for SPES beneficiaries. It uses QR scanning for attendance capture, supports role-based access control, and provides reporting, import tools, and directory/map views.

Core goals:
- Fast and reliable attendance capture using QR codes
- Role-based operations for leader, co-leader, and developer users
- Public visitor dashboard and barangay map views
- Structured import/export workflows for operational reporting

## 2. Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Data and State
- Supabase JavaScript Client
- TanStack React Query

### Forms and Validation
- React Hook Form
- Zod

### Scanner, File, and Utility Libraries
- html5-qrcode
- ExcelJS
- xlsx (SheetJS)
- Papa Parse
- file-saver
- date-fns
- date-fns-tz
- lucide-react

### Tooling
- ESLint
- TypeScript ESLint
- PostCSS
- Autoprefixer
- Prettier

## 3. High-Level Architecture

The application follows a frontend + backend service architecture:

1. Browser loads the React app (Vite build output).
2. React Router handles page-level navigation.
3. Protected pages use auth/profile checks from Supabase.
4. Feature modules call Supabase tables, RPC functions, storage, and edge functions.
5. SQL migrations define schema, RLS policies, triggers, and RPC logic.

## 4. Project Structure and Responsibilities

### Root Configuration
- package.json: Scripts, dependencies, and project metadata.
- vite.config.ts: Vite bundling/dev server configuration.
- tailwind.config.ts: Tailwind theme extensions and scan paths.
- postcss.config.js: Tailwind + autoprefixer setup.
- eslint.config.js: Linting rules for TS/React.
- tsconfig*.json: TypeScript compiler configuration.
- index.html: App mount point.

### Source Application (src)

#### App Bootstrap and Routing
- src/main.tsx: React root render and provider composition.
- src/app/providers.tsx: Theme and React Query providers.
- src/app/App.tsx: RouterProvider wrapper.
- src/app/router.tsx: Route definitions and role-based route wrapping.
- src/app/query-client.ts: Shared QueryClient defaults.
- src/app/GlobalHotkeys.tsx: Keyboard shortcut handling.

#### Shared Layouts and Guards
- src/components/shared/ProtectedRoute.tsx: Auth + role guard for private routes.
- src/components/shared/AppLayout.tsx: Authenticated shell layout and nav.
- src/components/shared/VisitorLayout.tsx: Public visitor shell layout.

#### Reusable UI Primitives
- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/Input.tsx
- src/components/ui/Modal.tsx
- src/components/ui/Table.tsx
- src/components/ui/Badge.tsx

These files centralize visual patterns and interaction consistency.

#### Feature Modules
- src/features/attendance/api.ts: Daily attendance fetch API.
- src/features/scanner/*: Scanner UI and scan RPC call handling.
- src/features/beneficiaries/*: Beneficiary operations and dialogs.
- src/features/imports/*: Import operations and validation preview.
- src/features/users/api.ts: User and leader directory RPC integration.
- src/features/auth/api.ts: Account register/verify edge function calls.
- src/features/profile/api.ts: Profile fetch/update and avatar upload.

#### Pages
- src/pages/LoginPage.tsx: Login flow.
- src/pages/RegisterPage.tsx: Registration flow with role and batch rules.
- src/pages/VerifyAccountPage.tsx: Email verification flow.
- src/pages/DashboardPage.tsx: Primary metrics dashboard.
- src/pages/VisitorDashboardPage.tsx: Public metrics dashboard.
- src/pages/BeneficiariesPage.tsx: Search/filter/archive beneficiaries.
- src/pages/BeneficiaryDetailsPage.tsx: Beneficiary edit + QR preview.
- src/pages/ArchivedBeneficiariesPage.tsx: Restore archived beneficiaries.
- src/pages/ImportMasterlistPage.tsx: CSV/XLSX import pipeline.
- src/pages/ScannerPage.tsx: Camera scan operations.
- src/pages/DailyAttendancePage.tsx: Daily attendance listing.
- src/pages/ReportsPage.tsx: XLSX exports.
- src/pages/UserManagementPage.tsx: User role management.
- src/pages/ProfilePage.tsx: User profile management.
- src/pages/LeadersDirectoryPage.tsx: Leader/co-leader directory.
- src/pages/BarangayMapPage.tsx: Internal map and assigned leaders.
- src/pages/VisitorBarangayMapPage.tsx: Public map and assigned leaders.
- src/pages/SettingsPage.tsx: Operational settings summary.

#### Shared Logic, Types, and Constants
- src/lib/supabase/client.ts: Frontend Supabase client setup.
- src/hooks/useAuth.ts: Auth/profile loading and role helper logic.
- src/lib/theme/ThemeContext.tsx: Light/dark theme state.
- src/lib/constants/attendance.ts: Attendance windows and timezone constants.
- src/lib/constants/barangays.ts: Barangay list and map pin metadata.
- src/lib/validators/import.ts: Import schema validation.
- src/lib/utils/*: Time handling, class merging, import normalization, export formatting, summary helpers.
- src/types/domain.ts: Domain-level TypeScript models.
- src/types/supabase.ts: Typed Supabase table interfaces.

### Supabase Backend (supabase)
- supabase/migrations/*.sql: Schema lifecycle and security rules.
- supabase/seed.sql: Seed data for initial/testing setup.
- supabase/functions/register-account/index.ts: Registration business rules, signup throttling, verification email.
- supabase/functions/verify-account/index.ts: Verification token handling and account activation.
- supabase/functions/record-scan/index.ts: Attendance scan endpoint wrapper.

## 5. Authentication and Authorization Model

Roles:
- leader
- co-leader
- developer

Access control:
- Route-level protection in frontend via ProtectedRoute.
- Data-level protection in Supabase via RLS policies and RPC security.

Public pages:
- Visitor dashboard
- Visitor barangay map

Private pages require authentication and valid profile role.

## 6. Attendance Processing Model

1. Scanner reads beneficiary QR value.
2. Frontend calls Supabase RPC (record_attendance_scan).
3. Backend classifies the scan (AM/PM in/out, late/early, invalid window, duplicate).
4. attendance_events stores raw event logs.
5. attendance_daily is recomputed as summarized daily view.

Timezone policy:
- Asia/Manila is used for attendance date/time boundaries and display.

## 7. Import and Export Workflows

### Import
- Accepts CSV and XLSX.
- Normalizes header keys and validates each row.
- Creates/updates barangays and beneficiaries.
- Generates and uploads QR images.
- Logs import results and row-level failures.

### Export
- Daily attendance XLSX export.
- Masterlist XLSX export with QR links/images and progress tracking.

## 8. Environment and Runtime Configuration

Required client env vars:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Edge function env vars (server-side) include:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SMTP_APP_PASSWORD
- LEADER_SIGNUP_CODE_* and CO_LEADER_SIGNUP_CODE_* variants
- APP_URL (optional fallback)

## 9. Build and Run

Common scripts:
- npm run dev
- npm run dev:8080
- npm run build
- npm run preview
- npm run lint
- npm run typecheck

## 10. Deployment Notes

Frontend:
- Deploy as static SPA (Netlify/Vercel compatible).
- Ensure redirect fallback is configured.

Backend:
- Apply all SQL migrations in sequence.
- Seed optional data if needed.
- Deploy Supabase edge functions and configure environment variables.

## 11. Documentation Readiness Checklist

Use this checklist before submission/turnover:
- [ ] All required env variables documented and available.
- [ ] Migration order validated on target environment.
- [ ] Route access matrix verified by role.
- [ ] Import sample file and export sample output attached.
- [ ] Visitor pages tested without login.
- [ ] Scanner tested on HTTPS-capable device/browser.
- [ ] Error messages reviewed for user clarity.

## 12. Notes on Legacy/Reference Files

The repository contains some Next.js-style helper/reference files that are not part of the main Vite runtime path. Keep them only if intentionally retained for migration/reference; otherwise archive or remove to reduce confusion.
