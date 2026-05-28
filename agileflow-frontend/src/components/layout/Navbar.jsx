import { useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import GlobalSearch from '../common/GlobalSearch'
import NotificationCenter from '../notifications/NotificationCenter'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/admin': 'Admin Panel',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()

  const title =
    pageTitles[pathname] ||
    (pathname.includes('/reports') ? 'Reports' :
    pathname.includes('/projects/') ? 'Project Details' : 'AgileFlow')

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4">
      <h1 className="text-xl font-semibold text-gray-800 shrink-0">{title}</h1>
      <div className="flex items-center gap-4 ml-auto">
        <GlobalSearch />
        <NotificationCenter />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
