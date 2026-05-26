import { SidebarTrigger, useSidebar } from './ui/sidebar'

import {
  Search,
  Bot,
} from 'lucide-react'

import { Input } from './ui/input'

import type React from 'react'

import { useAuth } from '@/contexts/AuthContext'

import {
  useEffect,
  useState,
} from 'react'

import { getStreak } from '@/services/firebase/user'

import AiChat from './AiChat'

import { useTranslation } from 'react-i18next'

const Header = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const { state } = useSidebar()

  const isCollapsed =
    state === 'collapsed'

  const { user } = useAuth()
  const { t } = useTranslation()

  const [streak, setStreak] = useState(0)
  const [openAiChat, setOpenAiChat] =
    useState(false)

  useEffect(() => {
    if (!user) return

    getStreak(user.uid).then(setStreak)
  }, [user])

  return (
    <div className="flex flex-col gap-4 pt-20">
      <header
        className={`fixed top-0 right-0 z-50 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md transition-all duration-300
        ${isCollapsed
          ? 'left-[var(--sidebar-width-icon)]'
          : 'left-[var(--sidebar-width)]'}
        max-md:left-0`}
      >
        <SidebarTrigger className="hidden max-[768px]:block" />

        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            placeholder={t('header.searchPlaceholder')}
            className="w-full max-w-96 border-none bg-muted/20 pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenAiChat(true)}
            className="rounded-2xl bg-muted/60 p-2 transition duration-300 hover:bg-muted"
          >
            <Bot className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-muted bg-background/50 px-4 py-1.5 max-[768px]:hidden">
            <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />

            <span className="text-xs font-bold uppercase tracking-wider">
              {t('header.streak')} {streak}{' '}
              {streak === 1 ? t('header.day') : t('header.days')}
            </span>
          </div>
        </div>
      </header>

      <AiChat
        open={openAiChat}
        onOpenChange={setOpenAiChat}
      />

      <main className="relative z-0">
        {children}
      </main>
    </div>
  )
}

export default Header