import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { type User } from "firebase/auth"
import Loading from "./Loading"

const PrivateRoute = () => {
  const { user, loading }: { user: User | null; loading: boolean } = useAuth()

  if (loading) return <Loading text="Loading" isCol/>
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export default PrivateRoute