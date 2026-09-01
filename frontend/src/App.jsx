import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import KanbanBoard from './pages/KanbanBoard'
import TasksTable from './pages/TasksTable'
import Team from './pages/Team'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function FullSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <FullSpinner />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects/:projectId/board" element={<KanbanBoard />} />
        <Route path="projects/:projectId/table" element={<TasksTable />} />
        <Route path="projects/:projectId/team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
