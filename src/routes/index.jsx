import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import LeavePage from '../pages/leave/LeavePage';
import LeaveMasterPage from '../pages/leave/LeaveMasterPage';
import OvertimePage from '../pages/overtime/OvertimePage';
import CorrectionPage from '../pages/correction/CorrectionPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ProfileChangeRequestsPage from '../pages/profile-change/ProfileChangeRequestsPage';
import EmployeeManagementPage from '../pages/employee/EmployeeManagementPage';
import MasterDataPage from '../pages/master-data/MasterDataPage';
import AuditLogPage from '../pages/audit-log/AuditLogPage';
import ApprovalPage from '../pages/approval/ApprovalPage';
import PayrollPage from '../pages/payroll/PayrollPage';
import PayslipsPage from '../pages/payslips/PayslipsPage';
import ShiftSchedulePage from '../pages/shift-schedule/ShiftSchedulePage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (<ProtectedRoute><MainLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'leave', element: <LeavePage /> },
      { path: 'leave/master', element: <LeaveMasterPage /> },
      { path: 'overtime', element: <OvertimePage /> },
      { path: 'correction', element: <CorrectionPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/change-requests', element: <ProfileChangeRequestsPage /> },
      { path: 'employees', element: <EmployeeManagementPage /> },
      { path: 'master-data', element: <MasterDataPage /> },
      { path: 'audit-log', element: <AuditLogPage /> },
      { path: 'approval', element: <ApprovalPage /> },
      { path: 'payroll', element: <PayrollPage /> },
      { path: 'payslips', element: <PayslipsPage /> },
      { path: 'shift-schedule', element: <ShiftSchedulePage /> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
