import { useAuthStore } from '../../store/authStore'

const statCards = [
  { label: 'Total Karyawan', value: '-', icon: '👥', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { label: 'Hadir Hari Ini', value: '-', icon: '✅', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
  { label: 'Cuti Aktif', value: '-', icon: '🌴', color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
  { label: 'Pending Approval', value: '-', icon: '⏳', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
]

const quickLinks = [
  { label: 'Absensi', desc: 'Catat kehadiran hari ini', icon: '📋', href: '/attendance' },
  { label: 'Pengajuan Cuti', desc: 'Ajukan cuti atau izin', icon: '🗂', href: '/leave' },
  { label: 'Lihat Shift', desc: 'Jadwal shift kerja', icon: '🗓', href: '/shift' },
  { label: 'Laporan', desc: 'Laporan kehadiran', icon: '📈', href: '/report' },
]

const DashboardPage = () => {
  const { user } = useAuthStore()

  const now = new Date()
  const greeting =
    now.getHours() < 11 ? 'Selamat Pagi' :
    now.getHours() < 15 ? 'Selamat Siang' :
    now.getHours() < 18 ? 'Selamat Sore' : 'Selamat Malam'

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <p className="text-indigo-200 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name || 'Karyawan'} 👋</h1>
        <p className="text-indigo-200 text-sm mt-1">
          {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
          <span className="text-xs">🏢 {user?.department || 'HRIS MSR'}</span>
          <span className="text-indigo-300">•</span>
          <span className="text-xs">{user?.role || 'Employee'}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-5 border ${card.border} shadow-sm`}>
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <span className="text-2xl block mb-2">{link.icon}</span>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">{link.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-sm font-medium text-blue-800">Sistem HRIS MSR</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Dashboard akan menampilkan data real-time setelah terhubung dengan backend. Pastikan backend Laravel sudah berjalan di <code className="bg-blue-100 px-1 rounded">localhost:8000</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
