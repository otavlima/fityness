import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog'
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import type {
  WorkoutGroup,
  WorkoutSession,
} from '@/pages/History'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type Props = {
  workout: WorkoutGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSession: (session: WorkoutSession) => void
}

const formatVolume = (volume: number) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}t`
  }
  return `${volume}kg`
}

const formatDuration = (seconds: number) => {
  const minutes = Math.max(1, Math.floor(seconds / 60))
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  return `${minutes}m`
}

const WorkoutHistoryModal = ({
  workout,
  open,
  onOpenChange,
  onSelectSession,
}: Props) => {
  const { t, i18n } = useTranslation()

  if (!workout) return null

  const sessions = workout.sessions || []

  const bestSession =
    sessions.length > 0
      ? sessions.reduce(
          (best, current) =>
            current.volume > best.volume ? current : best,
          sessions[0]
        )
      : null

  const latestSession = sessions[0]
  const rawCategory = (workout.category || '').toLowerCase().trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'overflow-hidden rounded-[28px] border-none bg-transparent p-0 outline-none shadow-xl',
          'w-[calc(100vw-24px)] max-w-[680px]',
          'max-h-[95vh]',
          '[@media(max-height:700px)]:max-h-[calc(100vh-1rem)]',
          '[&>button]:hidden'
        )}
      >
        <div className="overflow-hidden rounded-[28px] bg-background">
          <div className="relative overflow-hidden bg-foreground">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-background/10 bg-background/10 text-background/70 backdrop-blur-sm transition hover:text-background">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>

            <div
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, var(--background) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            <div className="relative z-10 px-4 pb-6 pt-5 sm:px-5 sm:pb-7 sm:pt-6">
              <div className="mb-4 inline-flex items-center rounded-full border border-background/10 bg-background/10 px-2.5 py-1 backdrop-blur-sm">
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-background/70">
                  {rawCategory 
                    ? t(rawCategory, { ns: 'translation', keyPrefix: 'history.categories', defaultValue: workout.category }) 
                    : t('historyCard.defaultCategory')
                  }
                </span>
              </div>

              <h2 className="max-w-[90%] text-[34px] font-extrabold leading-none tracking-[-0.07em] text-background sm:text-[38px]">
                {workout.workoutName}
              </h2>

              <p className="mt-2 text-xs font-medium text-background/60">
                {t('historyModal.sessionsCount', { count: workout.totalSessions })}
              </p>
            </div>
          </div>

          <div className="bg-background px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-[20px] border bg-card p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays size={11} />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em]">
                    {t('historyModal.labels.sessions')}
                  </span>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-none sm:text-[24px]">
                  {workout.totalSessions}
                </p>
              </div>

              <div className="rounded-[20px] border bg-card p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp size={11} />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em]">
                    {t('historyModal.labels.best')}
                  </span>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-none sm:text-[24px]">
                  {bestSession ? formatVolume(bestSession.volume) : '0kg'}
                </p>
              </div>

              <div className="rounded-[20px] border bg-card p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 size={11} />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em]">
                    {t('historyModal.labels.last')}
                  </span>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-none sm:text-[24px]">
                  {latestSession ? formatDuration(latestSession.duration) : '0m'}
                </p>
              </div>

              <div className="rounded-[20px] border bg-card p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Trophy size={11} />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em]">
                    {t('historyModal.labels.pr')}
                  </span>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-none sm:text-[24px]">
                  {sessions.filter((s) => s.isPR).length}
                </p>
              </div>
            </div>

            <div className="my-4 flex flex-col gap-3 rounded-[22px] border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background">
                  <Trophy size={14} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    {t('historyModal.labels.currentRecord')}
                  </p>
                  <p className="text-xs font-medium">
                    {t('historyModal.labels.performanceHint')}
                  </p>
                </div>
              </div>
              <p className="pl-[52px] text-xs font-semibold sm:pl-0">
                {bestSession ? formatVolume(bestSession.volume) : '0kg'}
              </p>
            </div>

            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {t('historyModal.labels.sessionHistory')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('historyModal.recentCount', { count: sessions.length })}
              </p>
            </div>

            <div
              className={cn(
                'scrollbar-hide overflow-y-auto pr-1',
                sessions.length >= 3 && 'max-h-[230px]'
              )}
            >
              <div className="flex flex-col gap-2 pb-4">
                {sessions.map((session) => {
                  const date = new Date(session.completedAt)
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className={cn(
                        'group flex min-h-[74px] items-center justify-between rounded-[22px] border bg-card px-3 py-3 text-left transition-all duration-200',
                        'hover:border-foreground/20 hover:bg-secondary/40'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[16px] bg-background">
                          <span className="text-lg font-bold leading-none">
                            {date.getDate()}
                          </span>
                          <span className="mt-0.5 text-[8px] font-semibold uppercase text-muted-foreground">
                            {date.toLocaleDateString(i18n.language, { month: 'short' })}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-base font-bold tracking-[-0.04em] sm:text-lg">
                              {date.toLocaleDateString(i18n.language, { weekday: 'long' })}
                            </p>
                            {session.isPR && (
                              <div className="rounded-full bg-foreground px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-background">
                                {t('historyModal.labels.pr')}
                              </div>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatDuration(session.duration)} • {session.sets} sets
                          </p>
                        </div>
                      </div>

                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <p className="text-[20px] font-bold leading-none tracking-[-0.05em] sm:text-[22px]">
                          {formatVolume(session.volume)}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-2xl border bg-card px-4 py-2 text-xs font-medium transition-all hover:bg-secondary"
              >
                {t('historyModal.buttons.close')}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WorkoutHistoryModal