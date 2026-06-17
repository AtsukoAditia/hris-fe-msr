import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import AttendancePage from '../pages/attendance/AttendancePage'
import ApprovalPage from '../pages/approval/ApprovalPage'
import ShiftPage from '../pages/shift/ShiftPage'
import ShiftSchedulePage from '../pages/shift-schedule/ShiftSchedulePage'
import ReportPage from '../pages/report/ReportPage'
import EmployeeManagementPage from '../pages/employee/EmployeeManagementPage'
import LeavePage from '../pages/leave/LeavePage'
import MasterDataPage from '../pages/master-data/MasterDataPage'
import ProfilePage from '../pages/profile/ProfilePage'

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['admin', 'hr', 'manager']} />}>
      <Route element={<MainLayout />}>
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/master-data" element={<MasterDataPage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
      <Route element={<MainLayout />}>
        <Route path="/employee" element={<EmployeeManagementPage />} />
        <Route path="/employee/:employeeId/profile" element={<ProfilePage />} />
        <Route path="/shift" element={<ShiftPage />} />
        <Route path="/shift-schedule" element={<ShiftSchedulePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default AppRoutes
