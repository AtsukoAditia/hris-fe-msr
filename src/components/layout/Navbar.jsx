import { useAuthStore } from '../../store/authStore'

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuthStore()

  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Buka menu navigasi"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="hidden text-base font-semibold text-gray-800 sm:block">HRIS MSR</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-500">{user?.role || 'Employee'}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
          <span className="text-sm font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
