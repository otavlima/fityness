import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  CalendarDays,
  X,
} from 'lucide-react'
import type {
  WorkoutGroup,
  WorkoutSession,
} from '@/pages/History'
import { cn } from '@/lib/utils'

type Props = {
  group: WorkoutGroup
  session: WorkoutSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatVolume = (volume: number) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}t`
  }

  return `${volume}kg`
}

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.floor(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  return `${totalMinutes}m`
}

const getTotalSets = (session: WorkoutSession) => {
  return session.exercises.reduce(
    (acc, exercise) => acc + exercise.sets.length,
    0
  )
}

const SessionHistoryModal = ({
  group,
  session,
  open,
  onOpenChange,
}: Props) => {
  if (!session) return null

  const date = new Date(session.completedAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'w-[calc(100vw-24px)] max-w-[540px]',
          'rounded-[28px] border border-border/60 bg-background',
          'max-h-[90vh]',
          'flex flex-col p-0 shadow-2xl'
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border/60 px-4 py-5 sm:px-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Workout Session
                </p>

                <h2 className="truncate text-[28px] font-semibold">
                  {group.workoutName}
                </h2>

                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <CalendarDays className="size-3.5" />

                  <span className="truncate">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Duration
                </p>

                <p className="text-lg font-semibold">
                  {formatDuration(session.duration)}
                </p>
              </div>

              <div className="rounded-2xl bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Volume
                </p>

                <p className="text-lg font-semibold">
                  {formatVolume(session.volume)}
                </p>
              </div>

              <div className="rounded-2xl bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Sets
                </p>

                <p className="text-lg font-semibold">
                  {getTotalSets(session)}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 scrollbar-hide">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Exercises
              </p>

              <span className="text-xs text-muted-foreground">
                {session.exercises.length} total
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:hidden">
              {session.exercises.map((exercise, index) => {
                const shouldScrollSets = exercise.sets.length > 5

                return (
                  <div
                    key={exercise.exerciseId}
                    className="min-w-[85%] rounded-3xl border border-border/60 bg-card p-4"
                  >
                    <div className="mb-4 flex gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">
                          {exercise.exerciseName}
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          {exercise.sets.length} sets
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'scrollbar-hide',
                        shouldScrollSets &&
                          'max-h-[252px] overflow-y-auto pr-1'
                      )}
                    >
                      <div className="space-y-2 pb-4">
                        {exercise.sets.map((set, i) => (
                          <div
                            key={i}
                            className="flex justify-between rounded-xl bg-muted/20 px-3 py-2"
                          >
                            <span className="text-sm text-muted-foreground">
                              Set {i + 1}
                            </span>

                            <span className="text-sm font-medium">
                              {set.kg} × {set.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden space-y-3 md:block">
              {session.exercises.map((exercise) => {
                const shouldScrollSets = exercise.sets.length > 5

                return (
                  <div
                    key={exercise.exerciseId}
                    className="rounded-3xl border border-border/60 bg-card p-4"
                  >
                    <h3 className="mb-3 text-lg font-semibold">
                      {exercise.exerciseName}
                    </h3>

                    <div
                      className={cn(
                        'scrollbar-hide',
                        shouldScrollSets &&
                          'max-h-[252px] overflow-y-auto pr-1'
                      )}
                    >
                      <div className="space-y-2 pb-4">
                        {exercise.sets.map((set, i) => (
                          <div
                            key={i}
                            className="flex justify-between rounded-xl bg-muted/20 px-3 py-2"
                          >
                            <span className="text-sm text-muted-foreground">
                              Set {i + 1}
                            </span>

                            <span className="text-sm font-medium">
                              {set.kg} × {set.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SessionHistoryModal