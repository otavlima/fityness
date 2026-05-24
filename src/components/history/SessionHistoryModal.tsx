import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

import {
  CalendarDays,
  Clock3,
  Dumbbell,
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
  onOpenChange: (
    open: boolean
  ) => void
}

const formatVolume = (
  volume: number
) => {
  if (volume >= 1000) {
    return `${(
      volume / 1000
    ).toFixed(1)}t`
  }

  return `${volume}kg`
}

const formatDuration = (
  seconds: number
) => {
  const totalMinutes =
    Math.max(
      1,
      Math.floor(seconds / 60)
    )

  const hours = Math.floor(
    totalMinutes / 60
  )

  const minutes =
    totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes
      .toString()
      .padStart(2, '0')}m`
  }

  return `${totalMinutes}m`
}

const getTotalSets = (
  session: WorkoutSession
) => {
  return session.exercises.reduce(
    (acc, exercise) =>
      acc + exercise.sets.length,
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

  const hasMultipleExercises =
    session.exercises.length > 1

  const date = new Date(
    session.completedAt
  )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={cn(
          'w-[calc(100vw-24px)] max-w-[540px]',
          'overflow-hidden rounded-[28px]',
          'border border-border/60 bg-background',
          'p-0 shadow-2xl',
          'max-h-[95vh]',
          '[@media(max-height:700px)]:max-h-[calc(100vh-1rem)]',
          '[&>button]:hidden'
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">

          {/* HEADER */}
          <div className="shrink-0 border-b border-border/60 px-4 py-5 sm:px-6">

            <div className="mb-5 flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1 space-y-1">

                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Workout Session
                </p>

                <h2 className="truncate text-[28px] font-semibold tracking-[-0.05em] text-foreground sm:text-[30px]">
                  {group.workoutName}
                </h2>

                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" />

                  <span className="truncate">
                    {date.toLocaleDateString(
                      'en-US',
                      {
                        weekday:
                          'long',
                        day: 'numeric',
                        month: 'long',
                      }
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenChange(false)
                }
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* STATS */}
            <div className="flex flex-col gap-3 md:grid md:grid-cols-3">

              <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border/60">
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  Duration
                </div>

                <p className="text-[22px] font-semibold tracking-[-0.04em]">
                  {formatDuration(
                    session.duration
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border/60">
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
                  <Dumbbell className="size-3.5" />
                  Volume
                </div>

                <p className="text-[22px] font-semibold tracking-[-0.04em]">
                  {formatVolume(
                    session.volume
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border/60">
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
                  <Dumbbell className="size-3.5" />
                  Sets
                </div>

                <p className="text-[22px] font-semibold tracking-[-0.04em]">
                  {getTotalSets(
                    session
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="min-h-0 flex-1 overflow-hidden px-4 py-5 sm:px-6">

            <div className="mb-4 flex items-center justify-between">

              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Exercises
              </p>

              <span className="text-[12px] text-muted-foreground">
                {
                  session.exercises.length
                }{' '}
                total
              </span>
            </div>

            {/* MOBILE */}
            <div
              className={cn(
                'scrollbar-hide flex gap-3 overflow-x-auto overflow-y-hidden pb-2 md:hidden',
                hasMultipleExercises &&
                  'snap-x snap-mandatory'
              )}
            >

              {session.exercises.map(
                (
                  exercise,
                  index
                ) => (
                  <div
                    key={
                      exercise.exerciseId
                    }
                    className={cn(
                      'rounded-3xl border border-border/60 bg-card p-4',
                      hasMultipleExercises
                        ? 'min-w-[85%] shrink-0 snap-start'
                        : 'w-full'
                    )}
                  >

                    <div className="mb-4 flex items-start gap-3">

                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-medium text-foreground">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                          {
                            exercise.exerciseName
                          }
                        </h3>

                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {
                            exercise.sets
                              .length
                          }{' '}
                          sets completed
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'space-y-2',
                        exercise.sets.length >=
                          5 &&
                          'max-h-[320px] overflow-y-auto pr-1 scrollbar-hide'
                      )}
                    >

                      {exercise.sets.map(
                        (
                          set,
                          setIndex
                        ) => (
                          <div
                            key={
                              setIndex
                            }
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-colors',
                              set.done
                                ? 'bg-muted/40'
                                : 'bg-muted/15 opacity-55'
                            )}
                          >

                            <span className="text-[13px] text-muted-foreground">
                              Set{' '}
                              {setIndex +
                                1}
                            </span>

                            <span className="shrink-0 text-[14px] font-medium tracking-[-0.02em] text-foreground">
                              {set.kg}{' '}
                              kg

                              <span className="mx-1 text-muted-foreground">
                                ×
                              </span>

                              {
                                set.reps
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* DESKTOP */}
            <div
              className={cn(
                'hidden scrollbar-hide overflow-y-auto pr-1 md:block',
                hasMultipleExercises &&
                  'max-h-[540px]'
              )}
            >
              <div className="flex flex-col gap-3">

                {session.exercises.map(
                  (
                    exercise,
                    index
                  ) => (
                    <div
                      key={
                        exercise.exerciseId
                      }
                      className="rounded-3xl border border-border/60 bg-card p-4"
                    >

                      <div className="mb-4 flex items-start gap-3">

                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-medium text-foreground">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                            {
                              exercise.exerciseName
                            }
                          </h3>

                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {
                              exercise
                                .sets
                                .length
                            }{' '}
                            sets completed
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'space-y-2',
                          exercise.sets
                            .length >=
                            5 &&
                            'max-h-[320px] overflow-y-auto pr-1 scrollbar-hide'
                        )}
                      >

                        {exercise.sets.map(
                          (
                            set,
                            setIndex
                          ) => (
                            <div
                              key={
                                setIndex
                              }
                              className={cn(
                                'flex items-center justify-between rounded-2xl px-3 py-2 transition-colors',
                                set.done
                                  ? 'bg-muted/40'
                                  : 'bg-muted/15 opacity-55'
                              )}
                            >

                              <span className="text-[13px] text-muted-foreground">
                                Set{' '}
                                {setIndex +
                                  1}
                              </span>

                              <span className="text-[14px] font-medium tracking-[-0.02em] text-foreground">
                                {
                                  set.kg
                                }{' '}
                                kg

                                <span className="mx-1 text-muted-foreground">
                                  ×
                                </span>

                                {
                                  set.reps
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}

                {hasMultipleExercises && (
                  <div className="h-16 shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SessionHistoryModal