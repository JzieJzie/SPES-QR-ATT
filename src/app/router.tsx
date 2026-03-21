import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '../components/shared/ProtectedRoute'
import { AppLayout } from '../components/shared/AppLayout'
import { VisitorLayout } from '../components/shared/VisitorLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { VerifyAccountPage } from '../pages/VerifyAccountPage'
import { DashboardPage } from '../pages/DashboardPage'
import { VisitorDashboardPage } from '../pages/VisitorDashboardPage'
import { BeneficiariesPage } from '../pages/BeneficiariesPage'
import { ImportMasterlistPage } from '../pages/ImportMasterlistPage'
import { BeneficiaryDetailsPage } from '../pages/BeneficiaryDetailsPage'
import { ArchivedBeneficiariesPage } from '../pages/ArchivedBeneficiariesPage'
import { ScannerPage } from '../pages/ScannerPage'
import { DailyAttendancePage } from '../pages/DailyAttendancePage'
import { ReportsPage } from '../pages/ReportsPage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { LeadersDirectoryPage } from '../pages/LeadersDirectoryPage'
import { BarangayMapPage } from '../pages/BarangayMapPage'
import { VisitorBarangayMapPage } from '../pages/VisitorBarangayMapPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-account',
    element: <VerifyAccountPage />,
  },
  {
    path: '/visitor',
    element: <VisitorLayout />,
    children: [
      { index: true, element: <VisitorDashboardPage /> },
      { path: 'barangay-map', element: <VisitorBarangayMapPage /> },
      { path: '*', element: <Navigate to="/visitor" replace /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['leader', 'co-leader', 'developer']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'beneficiaries', element: <BeneficiariesPage /> },
          { path: 'beneficiaries/import', element: <ImportMasterlistPage /> },
          { path: 'beneficiaries/:id', element: <BeneficiaryDetailsPage /> },
          { path: 'beneficiaries/archived', element: <ArchivedBeneficiariesPage /> },
          { path: 'scanner', element: <ScannerPage /> },
          { path: 'attendance/daily', element: <DailyAttendancePage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'leaders-directory', element: <LeadersDirectoryPage /> },
          { path: 'barangay-map', element: <BarangayMapPage /> },
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['leader', 'developer']}>
                <UserManagementPage />
              </ProtectedRoute>
            ),
          },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
