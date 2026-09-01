import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import { ArrowLeft, Columns3, List, Users, Loader2, Shield, UserCircle } from 'lucide-react'
import { cn } from '../lib/utils'

const roleBadge = {
  owner: 'bg-accent-muted text-accent',
  developer: 'bg-warn-muted text-warn',
  designer: 'bg-success-muted text-success',
  member: 'bg-muted-light text-fg',
}

export default function Team() {
  const { projectId } = useParams()

  const { data: members = [], isLoading, isError } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => api.get(`/projects/${projectId}/members`).then((r) => r.data),
  })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r) => r.data),
  })

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted hover:text-fg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-fg">{project?.name || 'Team'}</h2>
            <p className="text-xs text-muted">Team Members</p>
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
            to={`/projects/${projectId}/table`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-surface-alt transition-colors"
          >
            <List className="w-4 h-4" />
            Table
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-danger">Failed to load team members.</p>
          </div>
        )}

        {!isLoading && !isError && members.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-light mx-auto mb-3" />
            <p className="text-muted font-medium">No team members</p>
          </div>
        )}

        {!isLoading && !isError && members.length > 0 && (
          <div className="max-w-2xl">
            <div className="bg-surface-elevated rounded-card shadow-card border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface-alt">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-alt/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-muted text-accent flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold">
                        {member.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg">{member.user_name}</p>
                      <p className="text-xs text-muted">{member.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          roleBadge[member.role] || roleBadge.member
                        )}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
