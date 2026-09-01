import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import { cn } from '../lib/utils'
import {
  ArrowLeft,
  Columns3,
  Users,
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const statusBadge = {
  todo: 'bg-muted-light text-fg',
  in_progress: 'bg-warn-muted text-warn',
  done: 'bg-success-muted text-success',
}

export default function TasksTable() {
  const { projectId } = useParams()

  const [sortBy, setSortBy] = useState('order')
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks', projectId, { sortBy, sortDir, search: debouncedSearch, status: statusFilter }],
    queryFn: () =>
      api
        .get(`/projects/${projectId}/tasks`, {
          params: {
            sort_by: sortBy,
            sort_dir: sortDir,
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
          },
        })
        .then((r) => r.data),
  })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r) => r.data),
  })

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  const sortableHeader = (column, label) => (
    <button
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wider hover:text-fg transition-colors"
    >
      {label}
      <SortIcon column={column} />
    </button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted hover:text-fg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-fg">{project?.name || 'Tasks'}</h2>
            <p className="text-xs text-muted">Table View</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${projectId}/board`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-surface-alt transition-colors"
          >
            <Columns3 className="w-4 h-4" />
            Board
          </Link>
          <Link
            to={`/projects/${projectId}/team`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-surface-alt transition-colors"
          >
            <Users className="w-4 h-4" />
            Team
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted ml-auto">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-danger">Failed to load tasks.</p>
          </div>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted">No tasks found.</p>
          </div>
        )}

        {!isLoading && !isError && tasks.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4">
                  {sortableHeader('title', 'Title')}
                </th>
                <th className="text-left py-3 px-4 w-32">
                  {sortableHeader('status', 'Status')}
                </th>
                <th className="text-left py-3 px-4 w-40">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Assignee
                  </span>
                </th>
                <th className="text-left py-3 pl-4 w-32">
                  {sortableHeader('created_at', 'Created')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-fg">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                        statusBadge[task.status] || statusBadge.todo
                      )}
                    >
                      {task.status === 'in_progress'
                        ? 'In Progress'
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {task.assignee_name || (
                      <span className="text-muted-light">—</span>
                    )}
                  </td>
                  <td className="py-3 pl-4 text-muted text-xs tabular-nums">
                    {new Date(task.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
