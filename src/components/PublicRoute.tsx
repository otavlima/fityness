import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loading from './Loading'

const PublicRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
        <Loading text="Loading" isCol/>
    </div>
  )

  if (user) return <Navigate to="/" replace />

  return <Outlet />
}

export default PublicRoute