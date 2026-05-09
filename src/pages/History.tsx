import { useEffect, useMemo, useState } from 'react'

import Header from '@/components/Header'

import {
  Field,
  FieldDescription,
  FieldTitle
} from '@/components/ui/field'

import { Button } from '@/components/ui/button'

import {
  Filter as FilterIcon,
  ChevronRight,
  Clock,
  Dumbbell,
  Loader2,
  Trophy
} from 'lucide-react'

import { Card } from '@/components/ui/card'

import { useAuth } from '@/contexts/AuthContext'

import {
  getWorkoutHistory,
  type WorkoutHistoryDocument
} from '@/services/firebase/workoutHistory'

import FilterModal from '@/components/modals/FilterModal'

type HistoryWorkout = {
  id: string
  workoutId: string
  completedAt: Date
  day: string
  month: string
  title: string
  relativeDate: string
  time: string
  sets: number
  volume: number
  isPR: boolean
  isCompleted: boolean
}

const formatVolume = (volume: number) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}t`
  }

  return `${volume}kg`
}

const formatDuration = (seconds: number) => {
  const mins = Math.max(
    1,
    Math.floor(seconds / 60)
  )

  return `~${mins}m`
}

const History = () => {
  const { user } = useAuth()

  const [history, setHistory] = useState<
    WorkoutHistoryDocument[]
  >([])

  const [visibleCount, setVisibleCount] =
    useState(6)

  const [filterOpen, setFilterOpen] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return

      setLoading(true)

      try {
        const historyData =
          await getWorkoutHistory(user.uid)

        setHistory(historyData)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const historyData: HistoryWorkout[] =
    useMemo(() => {
      const sorted = [...history].sort(
        (a, b) =>
          b.completedAt.getTime() -
          a.completedAt.getTime()
      )

      const bestVolumeMap: Record<
        string,
        {
          id: string
          volume: number
        }
      > = {}

      const parsed = sorted.map(
        (workout, index) => {
          const date = new Date(
            workout.completedAt
          )

          const day = String(
            date.getDate()
          ).padStart(2, '0')

          const month = date
            .toLocaleString('en-US', {
              month: 'short',
            })
            .toUpperCase()
            .replace('.', '')

          let totalSets = 0
          let completedSets = 0
          let totalVolume = 0

          workout.exercises.forEach(
            (exercise) => {
              exercise.sets.forEach(
                (set) => {
                  totalSets += 1

                  if (!set.done) return

                  completedSets += 1

                  totalVolume +=
                    set.kg * set.reps
                }
              )
            }
          )

          const isCompleted =
            totalSets > 0 &&
            completedSets === totalSets

          return {
            id: workout.id,

            workoutId:
              workout.workoutId,

            completedAt:
              workout.completedAt,

            day,

            month,

            title:
              workout.workoutName,

            relativeDate:
              index === 0
                ? 'Today'
                : 'Recently',

            time: formatDuration(
              workout.duration
            ),

            sets: completedSets,

            volume: totalVolume,

            isPR: false,

            isCompleted,
          }
        }
      )

      const chronological = [...parsed].sort(
        (a, b) =>
          a.completedAt.getTime() -
          b.completedAt.getTime()
      )

      chronological.forEach((workout) => {
        const currentBest =
          bestVolumeMap[
            workout.workoutId
          ]

        const hasPrevious =
          currentBest !== undefined

        if (
          hasPrevious &&
          workout.volume >
            currentBest.volume
        ) {
          parsed.forEach((item) => {
            if (
              item.workoutId ===
              workout.workoutId
            ) {
              item.isPR = false
            }
          })

          workout.isPR = true
        }

        if (
          !currentBest ||
          workout.volume >
            currentBest.volume
        ) {
          bestVolumeMap[
            workout.workoutId
          ] = {
            id: workout.id,
            volume: workout.volume,
          }
        }
      })

      return parsed.sort(
        (a, b) =>
          b.completedAt.getTime() -
          a.completedAt.getTime()
      )
    }, [history])

  const hasMore =
    visibleCount < historyData.length

  const stats = useMemo(() => {
    const totalPRs = historyData.filter(
      (workout) => workout.isPR
    ).length

    const completedWorkouts =
      historyData.filter(
        (workout) =>
          workout.isCompleted
      ).length

    return {
      total: history.length,
      completed: completedWorkouts,
      prs: totalPRs,
    }
  }, [history, historyData])

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field>
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">
                Timeline
              </FieldDescription>

              <FieldTitle className="text-3xl font-bold tracking-tight">
                History
              </FieldTitle>

              <FieldDescription>
                Every workout saved.
                Every PR recorded.
              </FieldDescription>
            </Field>

            <Button
              variant="outline"
              className="rounded-full gap-2 px-6 border-border/60 font-semibold"
              onClick={() =>
                setFilterOpen(true)
              }
            >
              <FilterIcon size={16} />

              Filter
            </Button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-1 w-full justify-center items-center py-24">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />

                <span className="text-sm font-medium">
                  Loading history...
                </span>
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            history.length === 0 && (
              <div className="flex flex-1 w-full justify-center px-4">
                <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                  <h2 className="text-xl font-bold">
                    No workouts registered
                    yet
                  </h2>

                  <p className="text-muted-foreground text-sm">
                    Start tracking your
                    progress by training for
                    your first time.
                  </p>
                </div>
              </div>
            )}

          {/* CONTENT */}
          {!loading &&
            history.length > 0 && (
              <>
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6 rounded-2xl border-border/40 bg-card/50">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                      Total
                    </p>

                    <h2 className="text-5xl font-bold tracking-tighter">
                      {stats.total}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      workouts logged
                    </p>
                  </Card>

                  <Card className="p-6 rounded-2xl border-border/40 bg-card/50">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                      Completed workouts
                    </p>

                    <h2 className="text-5xl font-bold tracking-tighter">
                      {
                        stats.completed
                      }
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      fully completed
                      sessions
                    </p>
                  </Card>

                  <Card className="p-6 rounded-2xl bg-brand-gradient text-background border-none">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">
                      Personal records
                    </p>

                    <h2 className="text-5xl font-bold tracking-tighter">
                      {stats.prs} PRs
                    </h2>

                    <p className="text-sm opacity-60">
                      highest workout
                      volumes
                    </p>
                  </Card>
                </div>

                {/* LIST */}
                <div className="flex flex-col gap-3">
                  {historyData
                    .slice(
                      0,
                      visibleCount
                    )
                    .map((workout) => (
                      <div
                        key={
                          workout.id
                        }
                        className="group flex items-center justify-between p-3 bg-white dark:bg-zinc-900/30 border border-border/40 rounded-3xl hover:border-border transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex flex-col items-center justify-center min-w-[64px] h-[64px] bg-secondary/50 rounded-2xl">
                            <span className="text-xl font-bold leading-none">
                              {
                                workout.day
                              }
                            </span>

                            <span className="text-[10px] font-bold opacity-50 uppercase">
                              {
                                workout.month
                              }
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold tracking-tight">
                                {
                                  workout.title
                                }
                              </h3>

                              {workout.isPR && (
                                <span className="flex items-center gap-1 bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full text-[10px] font-black italic">
                                  <Trophy
                                    size={
                                      10
                                    }
                                    fill="currentColor"
                                  />

                                  PR
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[13px] text-muted-foreground font-medium">
                              <span>
                                {
                                  workout.relativeDate
                                }
                              </span>

                              <div className="flex items-center gap-1">
                                <Clock
                                  size={
                                    14
                                  }
                                />

                                {
                                  workout.time
                                }
                              </div>

                              <div className="flex items-center gap-1">
                                <Dumbbell
                                  size={
                                    14
                                  }
                                />

                                {
                                  workout.sets
                                }{' '}
                                sets
                              </div>

                              <span className="text-foreground font-bold">
                                {formatVolume(
                                  workout.volume
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    ))}
                </div>

                {/* LOAD MORE */}
                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() =>
                        setVisibleCount(
                          history.length
                        )
                      }
                      variant="secondary"
                      className="rounded-2xl px-10 py-6 h-auto text-sm font-bold"
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
      />
    </Header>
  )
}

export default History