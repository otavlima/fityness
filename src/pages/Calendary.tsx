import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Search, BellDot } from 'lucide-react'

const Calendary = () => {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-4 border-b border-border pb-4 px-4">
        <SidebarTrigger className="hidden max-[768px]:block" />
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder='Search for workouts, exercises...' className='pl-8 w-full max-w-96'/>
        </div>
        <div className="hover:bg-muted transition duration-300 p-2 rounded-2xl">
            <BellDot className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-muted py-1 px-4">
            <div className="bg-foreground h-2 w-2 rounded-full"></div>
            <span className='text-sm'>Streak: 12 dias</span>
        </div>
      </header>
    </div>
  )
}

export default Calendary