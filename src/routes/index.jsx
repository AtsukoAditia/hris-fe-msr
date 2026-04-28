import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

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
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/shift" element={<ShiftPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/leave" element={<LeavePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
