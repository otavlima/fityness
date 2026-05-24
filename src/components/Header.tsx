import { SidebarTrigger, useSidebar } from "./ui/sidebar"
import { Search, Bot } from "lucide-react"
import { Input } from "./ui/input"
import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { getStreak } from "@/services/firebase/user"

const Header = ({ children }: { children?: React.ReactNode }) => {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) return

    getStreak(user.uid).then(setStreak)
  }, [user])

  return (
    <div className="flex flex-col gap-4 pt-20">
      <header 
        className={`fixed top-0 right-0 flex items-center gap-4 py-4 px-4 transition-all duration-300 backdrop-blur-md bg-background/80 border-b border-border
        /* Aumentamos o z-index para 50 para garantir que fique no topo */
        z-50 
        ${isCollapsed ? 'left-[var(--sidebar-width-icon)]' : 'left-[var(--sidebar-width)]'}
        max-md:left-0`}
      >
        <SidebarTrigger className="hidden max-[768px]:block" />
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder='Search for workouts, exercises...' 
            className='pl-8 w-full max-w-96 bg-muted/20 border-none'
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/60 hover:bg-muted transition duration-300 p-2 rounded-2xl cursor-pointer">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 max-[768px]:hidden rounded-2xl border border-muted py-1.5 px-4 bg-background/50">
            <div className="bg-orange-500 h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
            <span className='text-xs font-bold uppercase tracking-wider'>Streak: {streak} dias</span>
          </div>
        </div>
      </header>
      <main className="relative z-0">
        {children}
      </main>
    </div>
  )
}

export default Header