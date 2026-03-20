import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '../components/shared/ProtectedRoute'
import { AppLayout } from '../components/shared/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { BeneficiariesPage } from '../pages/BeneficiariesPage'
import { ImportMasterlistPage } from '../pages/ImportMasterlistPage'
import { BeneficiaryDetailsPage } from '../pages/BeneficiaryDetailsPage'
import { ArchivedBeneficiariesPage } from '../pages/ArchivedBeneficiariesPage'
import { ScannerPage } from '../pages/ScannerPage'
import { DailyAttendancePage } from '../pages/DailyAttendancePage'
import { ReportsPage } from '../pages/ReportsPage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { SettingsPage } from '../pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['admin', 'scanner']} />,
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
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
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
