import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  {
    id: 'my-profile',
    label: 'Profil Saya',
    icon: '👤',
    children: [
      { path: '/profile', label: 'Data Profil', icon: '👤' },
      { path: '/profile/changes', label: 'Perubahan Profil', icon: '📝' },
      { path: '/security', label: 'Keamanan Akun', icon: '🔐' },
      { path: '/documents', label: 'Dokumen Saya', icon: '📄' },
    ],
  },
  { path: '/attendance', label: 'Absensi', icon: '📋' },
  { path: '/correction', label: 'Koreksi Absensi', icon: '✏️' },
  { path: '/leave', label: 'Cuti', icon: '🌴' },
  { path: '/overtime', label: 'Lembur', icon: '⏱️' },
  { path: '/approval', label: 'Persetujuan', icon: '✅', allowedRoles: ['admin', 'hr', 'manager'] },
  { path: '/profile-change-reviews', label: 'Review Profil', icon: '🧾', allowedRoles: ['admin', 'hr'] },
  { path: '/report', label: 'Laporan', icon: '📈', allowedRoles: ['admin', 'hr', 'manager'] },
  { path: '/master-data', label: 'Departemen', icon: '🏢', allowedRoles: ['admin', 'hr', 'manager'] },
  { path: '/employee', label: 'Karyawan', icon: '👥', allowedRoles: ['admin', 'hr'] },
  { path: '/shift', label: 'Shift', icon: '🗓', allowedRoles: ['admin', 'hr'] },
  { path: '/shift-schedule', label: 'Jadwal Shift', icon: '📅', allowedRoles: ['admin', 'hr'] },
  { path: '/leave-master', label: 'Master Cuti', icon: '🌿', allowedRoles: ['admin', 'hr'] },
  { path: '/payroll', label: 'Payroll', icon: '💰', allowedRoles: ['admin', 'hr'] },
  { path: '/audit-log', label: 'Audit Log', icon: '🔍', allowedRoles: ['admin', 'hr'] },
]

const canAccess = (item, role) => !item.allowedRoles?.length || item.allowedRoles.includes(role)

const isPathActive = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`)

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const userPhoto = user?.face_image_url || user?.photo || user?.employee?.face_image_url || user?.employee?.photo || null

  const filteredNavItems = navItems
    .filter((item) => canAccess(item, user?.role))
    .map((item) => item.children
      ? { ...item, children: item.children.filter((child) => canAccess(child, user?.role)) }
      : item)

  const profileGroupActive = filteredNavItems
    .find((item) => item.id === 'my-profile')
    ?.children.some((child) => isPathActive(location.pathname, child.path)) ?? false

  const [openGroups, setOpenGroups] = useState({ 'my-profile': profileGroupActive })

  useEffect(() => {
    if (profileGroupActive) {
      setOpenGroups((current) => ({ ...current, 'my-profile': true }))
    }
  }, [profileGroupActive])

  const toggleGroup = (id) => {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center"><span className="text-white text-sm font-bold">H</span></div>
            <div><h1 className="text-base font-bold text-gray-900">HRIS MSR</h1><p className="text-xs text-gray-500">Human Resource System</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            if (item.children) {
              const isExpanded = Boolean(openGroups[item.id])
              const isGroupActive = item.children.some((child) => isPathActive(location.pathname, child.path))

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`${item.id}-submenu`}
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isGroupActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
                  </button>
                  {isExpanded && (
                    <div id={`${item.id}-submenu`} className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          onClick={onClose}
                          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                          <span>{child.icon}</span><span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink key={item.path} to={item.path} end onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-lg">{item.icon}</span><span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
              {userPhoto ? <img src={userPhoto} alt={user?.name || 'User'} className="w-full h-full object-cover" /> : <span className="text-sm font-semibold text-indigo-700">{getInitial(user?.name)}</span>}
            </div>
            <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p><p className="text-xs text-gray-500 capitalize">{user?.role || '-'}</p></div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"><span className="text-lg">🚪</span><span>Logout</span></button>
        </div>
      </aside>
    </>
  )
}

const getInitial = (name) => name ? name.trim().charAt(0).toUpperCase() : 'U'

export default Sidebar
