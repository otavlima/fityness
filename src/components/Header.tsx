import { SidebarTrigger, useSidebar } from "./ui/sidebar"
import { Search, BellDot } from "lucide-react"
import { Input } from "./ui/input"
import type React from "react"

const Header = ({ children }: { children?: React.ReactNode }) => {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-col gap-4 pt-20">
      <header className={`fixed top-0 right-0 z-10 backdrop-blur-md bg-background/80 border-b border-border flex items-center gap-4 py-4 px-4 transition-all duration-300
        ${isCollapsed ? 'left-[var(--sidebar-width-icon)]' : 'left-[var(--sidebar-width)]'}
        max-md:left-0`}
      >
        <SidebarTrigger className="hidden max-[768px]:block" />
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder='Search for workouts, exercises...' className='pl-8 w-full max-w-96'/>
        </div>
        <div className="hover:bg-muted transition duration-300 p-2 rounded-2xl">
          <BellDot className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 max-[768px]:hidden rounded-2xl border border-muted py-1 px-4">
          <div className="bg-foreground h-2 w-2 rounded-full"></div>
          <span className='text-sm'>Streak: 12 dias</span>
        </div>
      </header>
      {children}
    </div>
  )
}

export default Header