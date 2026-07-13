import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import LeavePage from "../pages/leave/LeavePage";
import LeaveMasterPage from "../pages/leave/LeaveMasterPage";
import OvertimePage from "../pages/overtime/OvertimePage";
import CorrectionPage from "../pages/correction/CorrectionPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ProfileChangeRequestsPage from "../pages/profile-change/ProfileChangeRequestsPage";
import EmployeeManagementPage from "../pages/employee/EmployeeManagementPage";
import MasterDataPage from "../pages/master-data/MasterDataPage";
import AuditLogPage from "../pages/audit-log/AuditLogPage";
import ApprovalPage from "../pages/approval/ApprovalPage";
import PayrollPage from "../pages/payroll/PayrollPage";
import PayslipsPage from "../pages/payslips/PayslipsPage";
import ShiftSchedulePage from "../pages/shift-schedule/ShiftSchedulePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="leave/master" element={<LeaveMasterPage />} />
          <Route path="overtime" element={<OvertimePage />} />
          <Route path="correction" element={<CorrectionPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/change-requests" element={<ProfileChangeRequestsPage />} />
          <Route path="employees" element={<EmployeeManagementPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="approval" element={<ApprovalPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="payslips" element={<PayslipsPage />} />
          <Route path="shift-schedule" element={<ShiftSchedulePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
