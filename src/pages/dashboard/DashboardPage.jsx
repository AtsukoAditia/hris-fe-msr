import { useAuthStore } from '../../store/authStore'
import { useAttendanceStore } from '../../store/attendanceStore'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { todayAttendance } = useAttendanceStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang, {user?.name || 'Karyawan'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Status Hari Ini</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {todayAttendance ? 'Hadir' : 'Belum Absen'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Jam Masuk</p>
          <p className="text-2xl font-bold mt-1">
            {todayAttendance?.check_in_time || '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Jam Keluar</p>
          <p className="text-2xl font-bold mt-1">
            {todayAttendance?.check_out_time || '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Kehadiran Bulan Ini</p>
          <p className="text-2xl font-bold mt-1">-</p>
        </div>
      </div>

      {/* TODO: Add recent activity, announcements, quick actions */}
    </div>
  )
}

export default DashboardPage
