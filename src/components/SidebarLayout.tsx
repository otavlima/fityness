import { SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <Sidebar />
      <main className="flex-1 py-4">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout