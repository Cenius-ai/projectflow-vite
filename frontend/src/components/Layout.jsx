import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import {
  LayoutDashboard,
  Columns3,
  List,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  FolderKanban,
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

function ProjectNavItem({ project }) {
  return (
    <>
      <NavLink
        to={`/projects/${project.id}/board`}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
            isActive
              ? 'bg-accent-muted text-accent font-medium'
              : 'text-muted hover:text-fg hover:bg-surface-alt'
          )
        }
      >
        <Columns3 className="w-4 h-4 shrink-0" />
        <span className="truncate">{project.name}</span>
      </NavLink>
      <NavLink
        to={`/projects/${project.id}/table`}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 px-3 py-1.5 pl-10 rounded-lg text-sm transition-colors',
            isActive
              ? 'bg-accent-muted text-accent font-medium'
              : 'text-muted hover:text-fg hover:bg-surface-alt'
          )
        }
      >
        <List className="w-4 h-4 shrink-0" />
        <span className="truncate">Table</span>
      </NavLink>
      <NavLink
        to={`/projects/${project.id}/team`}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 px-3 py-1.5 pl-10 rounded-lg text-sm transition-colors',
            isActive
              ? 'bg-accent-muted text-accent font-medium'
              : 'text-muted hover:text-fg hover:bg-surface-alt'
          )
        }
      >
        <Users className="w-4 h-4 shrink-0" />
        <span className="truncate">Team</span>
      </NavLink>
    </>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Left Rail */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface-alt flex flex-col">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight text-fg flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-accent" />
            ProjectFlow
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-accent-muted text-accent font-medium'
                    : 'text-muted hover:text-fg hover:bg-surface-alt'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}

          {/* Projects section */}
          {projects.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Projects
                </p>
              </div>
              {projects.map((p) => (
                <ProjectNavItem key={p.id} project={p} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-accent-muted text-accent font-medium'
                  : 'text-muted hover:text-fg hover:bg-surface-alt'
              )
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger-muted transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
          <div className="px-3 pt-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent text-accent-fg flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-fg truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
