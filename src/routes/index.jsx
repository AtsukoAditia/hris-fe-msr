import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'

import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import AttendancePage from '../pages/attendance/AttendancePage'
import ApprovalPage from '../pages/approval/ApprovalPage'
import ShiftPage from '../pages/shift/ShiftPage'
import ReportPage from '../pages/report/ReportPage'
import EmployeePage from '../pages/employee/EmployeePage'
import LeavePage from '../pages/leave/LeavePage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          <Route path="/shift" element={<ShiftPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/leave" element={<LeavePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
        <Route element={<MainLayout />}>
          <Route path="/employee" element={<EmployeePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
