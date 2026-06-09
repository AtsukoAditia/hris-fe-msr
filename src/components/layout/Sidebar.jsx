import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/attendance', label: 'Absensi', icon: '📋' },
  { path: '/leave', label: 'Cuti', icon: '🌴' },
  { path: '/approval', label: 'Persetujuan', icon: '✅', allowedRoles: ['admin', 'hr', 'manager'] },
  { path: '/report', label: 'Laporan', icon: '📈', allowedRoles: ['admin', 'hr', 'manager'] },
  { path: '/employee', label: 'Karyawan', icon: '👥', allowedRoles: ['admin', 'hr'] },
  { path: '/shift', label: 'Shift', icon: '🗓', allowedRoles: ['admin', 'hr'] },
  { path: '/shift-schedule', label: 'Jadwal Shift', icon: '📅', allowedRoles: ['admin', 'hr'] },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const userPhoto = user?.face_image_url || user?.photo || user?.employee?.face_image_url || user?.employee?.photo || null

  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true
    return item.allowedRoles.includes(user?.role)
  })

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">HRIS MSR</h1>
              <p className="text-xs text-gray-500">Human Resource System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
              {userPhoto ? (
                <img src={userPhoto} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-indigo-700">{getInitial(user?.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || '-'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

const getInitial = (name) => {
  if (!name) return 'U'
  return name.trim().charAt(0).toUpperCase()
}

export default Sidebar
