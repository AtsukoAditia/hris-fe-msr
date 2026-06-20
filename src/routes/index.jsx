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
import DocumentsPage from '../pages/documents/DocumentsPage'
import AccountSecurityPage from '../pages/security/AccountSecurityPage'
import ProfileChangeRequestsPage from '../pages/profile-change/ProfileChangeRequestsPage'
import CorrectionPage from '../pages/correction/CorrectionPage'
import AuditLogPage from '../pages/audit-log/AuditLogPage'
import LeaveMasterPage from '../pages/leave/LeaveMasterPage'
import OvertimePage from '../pages/overtime/OvertimePage'
import PayrollPage from '../pages/payroll/PayrollPage'
import PayslipsPage from '../pages/payslips/PayslipsPage'

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/overtime" element={<OvertimePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/changes" element={<ProfileChangeRequestsPage />} />
        <Route path="/security" element={<AccountSecurityPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/correction" element={<CorrectionPage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
      <Route element={<MainLayout />}>
        <Route path="/payslips" element={<PayslipsPage />} />
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
        <Route path="/employee/:employeeId/documents" element={<DocumentsPage />} />
        <Route path="/profile-change-reviews" element={<ProfileChangeRequestsPage reviewMode />} />
        <Route path="/shift" element={<ShiftPage />} />
        <Route path="/shift-schedule" element={<ShiftSchedulePage />} />
        <Route path="/leave-master" element={<LeaveMasterPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default AppRoutes
