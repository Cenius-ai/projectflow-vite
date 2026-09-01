import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../api/client'
import { cn } from '../lib/utils'
import {
  Plus,
  GripVertical,
  Loader2,
  ArrowLeft,
  List,
  Users,
} from 'lucide-react'

const STATUSES = [
  { key: 'todo', label: 'To Do', color: 'bg-muted-light', dot: 'bg-muted' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-warn-muted', dot: 'bg-warn' },
  { key: 'done', label: 'Done', color: 'bg-success-muted', dot: 'bg-success' },
]

// ═══ Task Card ═══

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-surface-elevated rounded-lg border border-border p-3 shadow-sm cursor-grab active:cursor-grabbing group hover:border-accent/40 hover:shadow-md transition-all'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-light shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-fg">{task.title}</p>
          {task.assignee_name && (
            <p className="text-xs text-muted mt-1">
              {task.assignee_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ Column ═══

function Column({ status, tasks }) {
  const columnTasks = tasks.filter((t) => t.status === status.key)

  return (
    <div className="flex flex-col w-80 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={cn('w-2.5 h-2.5 rounded-full', status.dot)} />
        <h3 className="text-sm font-semibold text-fg">{status.label}</h3>
        <span className="text-xs text-muted bg-surface-alt px-1.5 py-0.5 rounded-full">
          {columnTasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className={cn('flex-1 rounded-lg p-2 space-y-2 min-h-[200px]', status.color)}>
        <SortableContext
          items={columnTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {columnTasks.length === 0 && (
          <p className="text-xs text-muted text-center py-8">No tasks</p>
        )}
      </div>
    </div>
  )
}

// ═══ Add Task Form ═══

function AddTaskForm({ projectId, status, onClose }) {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body) => api.post(`/projects/${projectId}/tasks`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({ title: title.trim(), status })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        autoFocus
        className="w-full px-2 py-1.5 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-3 py-1 rounded bg-accent text-accent-fg text-xs font-medium hover:opacity-90 disabled:opacity-60"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 rounded text-xs text-muted hover:text-fg"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ═══ Page ═══

export default function KanbanBoard() {
  const { projectId } = useParams()
  const queryClient = useQueryClient()
  const [activeTask, setActiveTask] = useState(null)
  const [addingInColumn, setAddingInColumn] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () =>
      api.get(`/projects/${projectId}/tasks`, { params: { sort_by: 'order' } }).then((r) => r.data),
  })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r) => r.data),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }) => api.put(`/tasks/${taskId}`, body),
  })

  const handleDragStart = useCallback(
    (event) => {
      const task = tasks.find((t) => t.id === event.active.id)
      setActiveTask(task || null)
    },
    [tasks]
  )

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      setActiveTask(null)

      if (!over) return

      const activeTaskId = active.id
      const overTaskId = over.id

      const draggedTask = tasks.find((t) => t.id === activeTaskId)
      const overTask = tasks.find((t) => t.id === overTaskId)

      if (!draggedTask || !overTask) return

      // If dropped on same task, no change
      if (activeTaskId === overTaskId) return

      const newStatus = overTask.status
      const sameColumn = draggedTask.status === newStatus

      // Build new order
      const columnTasks = tasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.order - b.order)

      // Remove dragged from column (if same column)
      let reordered
      if (sameColumn) {
        reordered = columnTasks.filter((t) => t.id !== activeTaskId)
      } else {
        reordered = [...columnTasks]
      }

      // Insert at over position
      const overIndex = reordered.findIndex((t) => t.id === overTaskId)
      reordered.splice(overIndex, 0, { ...draggedTask, status: newStatus })

      // Optimistically update cache
      const optimistic = tasks.map((t) => {
        if (t.id === activeTaskId) {
          return { ...t, status: newStatus, order: overIndex + 1 }
        }
        // Re-assign orders for column tasks
        const idx = reordered.findIndex((rt) => rt.id === t.id)
        if (idx !== -1) {
          return { ...t, order: idx + 1 }
        }
        return t
      })

      queryClient.setQueryData(['tasks', projectId], optimistic)

      // Persist to server
      const updates = reordered.map((t, i) => ({
        taskId: t.id,
        body: { order: i + 1, status: t.id === activeTaskId ? newStatus : undefined },
      }))

      Promise.all(updates.map((u) => updateTaskMutation.mutateAsync(u))).catch(() => {
        // Revert on failure
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      })
    },
    [tasks, projectId, queryClient, updateTaskMutation]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">Failed to load tasks.</p>
      </div>
    )
  }

  const activeTaskData = activeTask ? tasks.find((t) => t.id === activeTask.id) : null

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-muted hover:text-fg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-fg">
              {project?.name || 'Board'}
            </h2>
            <p className="text-xs text-muted">Kanban Board</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${projectId}/table`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-surface-alt transition-colors"
          >
            <List className="w-4 h-4" />
            Table
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

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-h-full">
            {STATUSES.map((status) => (
              <div key={status.key} className="flex flex-col w-80 shrink-0">
                <Column status={status} tasks={tasks} />
                {addingInColumn === status.key ? (
                  <div className="px-2 mt-2">
                    <AddTaskForm
                      projectId={projectId}
                      status={status.key}
                      onClose={() => setAddingInColumn(null)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingInColumn(status.key)}
                    className="flex items-center gap-1 px-2 py-2 mt-1 text-xs text-muted hover:text-fg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add task
                  </button>
                )}
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTaskData ? (
              <div className="bg-surface-elevated rounded-lg border border-accent/40 p-3 shadow-lg rotate-1 w-72">
                <p className="text-sm font-medium text-fg">{activeTaskData.title}</p>
                {activeTaskData.assignee_name && (
                  <p className="text-xs text-muted mt-1">{activeTaskData.assignee_name}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
