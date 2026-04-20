import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Field, FieldDescription, FieldTitle } from "./ui/field"
import LogoIcon from "./LogoIcon"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  History,
  TrendingUp,
  Settings,
  LogOut,
  Sparkles,
  ChevronUp,
  CornerUpRight,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/contexts/UserProfileContext"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Workouts",  icon: Dumbbell,        path: "/workouts" },
  { label: "Calendary", icon: Calendar,        path: "/calendary" },
  { label: "History",   icon: History,         path: "/history" },
  { label: "Progress",  icon: TrendingUp,      path: "/progress" },
]

const generalItems = [
  { label: "Configurations", icon: Settings, path: "/configurations" },
]

function Sidebar() {
  const { logout, user }                    = useAuth()
  const { profile, avatarUrl }              = useUserProfile()
  const { state, openMobile, setOpenMobile } = useSidebar()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isOpen    = state === "expanded" || openMobile

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const handleNavigate = (path: string) => {
    navigate(path)
    setOpenMobile(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader className="p-4">
        <Field className="flex flex-col gap-1">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${isOpen ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex gap-2 items-center overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'}`}>
              <div className="rounded-lg bg-sidebar-accent shrink-0 p-2">
                <LogoIcon />
              </div>
              <FieldTitle className="text-2xl font-bold whitespace-nowrap">Fitify</FieldTitle>
            </div>
            <SidebarTrigger className="shrink-0" />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
            <FieldDescription className="tracking-widest text-[12px]">TRAIN. TRACK. EVOLVE.</FieldDescription>
          </div>
        </Field>
        <div className={`w-[calc(100%+2rem)] -mx-4 ${isOpen ? 'mt-4' : ''} h-[1px] bg-sidebar-border`} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map(({ label, icon: Icon, path }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton
                  isActive={location.pathname === path}
                  onClick={() => handleNavigate(path)}
                  tooltip={label}
                  className="data-[active=true]:bg-primary data-[active=true]:text-background cursor-pointer"
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarMenu>
            {generalItems.map(({ label, icon: Icon, path }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton
                  isActive={location.pathname === path}
                  onClick={() => handleNavigate(path)}
                  tooltip={label}
                  className="data-[active=true]:bg-primary data-[active=true]:text-background cursor-pointer"
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="rounded-xl bg-primary p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-background" />
                <span className="text-xs font-bold tracking-widest text-background">AI</span>
              </div>
              <p className="text-sm text-background/80">Unlock an intelligent assistant and get answers...</p>
              <Button variant="secondary">
                Get Started <CornerUpRight />
              </Button>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="w-8 h-8 shrink-0">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{profile?.name ?? user?.displayName ?? 'User'}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto shrink-0" size={16} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <div className="px-2 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium">{profile?.name ?? user?.displayName ?? 'User'}</p>
                  <p className="text-xs text-muted-foreground">Plan Free · 28 workouts</p>
                </div>
                <DropdownMenuItem onClick={() => handleNavigate('/configurations')}>
                  <Settings size={16} className="mr-2" />
                  Configurations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/upgrade')}>
                  <Sparkles size={16} className="mr-2" />
                  Active AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  )
}

export default Sidebar