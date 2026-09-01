import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Plus, FolderKanban, Columns3, List, Users, Loader2, Hash } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const queryClient = useQueryClient()

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/projects', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
    },
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate({ name: newName.trim(), description: newDesc.trim() })
  }

  const statusColors = {
    todo: 'bg-muted-light text-fg',
    in_progress: 'bg-warn-muted text-warn',
    done: 'bg-success-muted text-success',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-fg">Dashboard</h2>
          <p className="text-sm text-muted mt-0.5">Your projects and task summaries</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-surface-elevated rounded-card shadow-card border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-fg mb-4">Create Project</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-fg mb-1">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Project name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm text-muted hover:text-fg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects list */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="text-danger">Failed to load projects. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-muted-light mx-auto mb-3" />
          <p className="text-muted text-lg font-medium">No projects yet</p>
          <p className="text-sm text-muted mt-1">Create your first project to get started.</p>
        </div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/board`}
              className="block bg-surface-elevated rounded-card shadow-card border border-border p-5 hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-fg group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-muted bg-surface-alt px-2 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  {project.total_tasks}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-muted line-clamp-2 mb-4">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Columns3 className="w-3.5 h-3.5" />
                  Board
                </span>
                <span className="inline-flex items-center gap-1">
                  <List className="w-3.5 h-3.5" />
                  Table
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Team
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
