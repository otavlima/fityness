import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'

import {
  Field,
  FieldDescription,
  FieldTitle,
} from '@/components/ui/field'

import { Button } from '@/components/ui/button'

import {
  Filter as FilterIcon,
  Loader2,
} from 'lucide-react'

import { Card } from '@/components/ui/card'

import { useAuth } from '@/contexts/AuthContext'

import {
  getWorkoutHistory,
  type WorkoutHistoryDocument,
} from '@/services/firebase/workoutHistory'

import {
  getWorkouts,
  type WorkoutDocument,
} from '@/services/firebase/workout'

import FilterModal from '@/components/modals/FilterModal'

import HistoryWorkoutCard from '@/components/history/HistoryWorkoutCard'

import WorkoutHistoryModal from '@/components/history/WorkoutHistoryModal'

import SessionHistoryModal from '@/components/history/SessionHistoryModal'

export type WorkoutSession = {
  id: string
  completedAt: Date
  duration: number
  volume: number
  sets: number
  exercises: WorkoutHistoryDocument['exercises']
  isPR: boolean
}

export type WorkoutGroup = {
  workoutId: string
  workoutName: string
  totalSessions: number
  totalVolume: number
  bestVolume: number
  lastDuration: number
  currentPRExercise: string
  latestCompletedAt: Date
  sessions: WorkoutSession[]
  category?: string
}

export type HistoryFilters = {
  period: string
  categories: string[]
  duration: string
  orderBy: string
  onlyPR: boolean
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

const defaultFilters: HistoryFilters =
  {
    period: '30d',
    categories: [],
    duration: 'any',
    orderBy: 'recent',
    onlyPR: false,
  }

const History = () => {
  const { user } = useAuth()

  const [history, setHistory] =
    useState<
      WorkoutHistoryDocument[]
    >([])

  const [workouts, setWorkouts] =
    useState<WorkoutDocument[]>([])

  const [
    selectedWorkout,
    setSelectedWorkout,
  ] = useState<WorkoutGroup | null>(
    null
  )

  const [
    workoutModalOpen,
    setWorkoutModalOpen,
  ] = useState(false)

  const [
    selectedSession,
    setSelectedSession,
  ] = useState<WorkoutSession | null>(
    null
  )

  const [
    sessionModalOpen,
    setSessionModalOpen,
  ] = useState(false)

  const [filterOpen, setFilterOpen] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [
    selectedGroup,
    setSelectedGroup,
  ] = useState<WorkoutGroup | null>(
    null
  )

  const [visibleGroups, setVisibleGroups] =
    useState(10)

  const [filters, setFilters] =
    useState<HistoryFilters>(
      defaultFilters
    )

  useEffect(() => {
    const load = async () => {
      if (!user) return

      setLoading(true)

      try {
        const [
          historyData,
          workoutsData,
        ] = await Promise.all([
          getWorkoutHistory(user.uid),
          getWorkouts(user.uid),
        ])

        setHistory(historyData.history)

        setWorkouts(workoutsData)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const groupedHistory =
    useMemo<WorkoutGroup[]>(() => {
      const grouped = new Map<
        string,
        WorkoutHistoryDocument[]
      >()

      history.forEach((session) => {
        const current =
          grouped.get(session.workoutId) ||
          []

        current.push(session)

        grouped.set(
          session.workoutId,
          current
        )
      })

      let groups = Array.from(
        grouped.entries()
      ).map(([workoutId, sessions]) => {
        const sortedSessions =
          [...sessions].sort(
            (a, b) =>
              b.completedAt.getTime() -
              a.completedAt.getTime()
          )

        const workoutData =
          workouts.find(
            (w) =>
              w.id === workoutId
          )

        let totalVolume = 0

        let bestSessionVolume = 0

        const calculatedSessions =
          sortedSessions.map(
            (session) => {
              let sessionVolume = 0

              let totalSets = 0

              session.exercises.forEach(
                (exercise) => {
                  exercise.sets.forEach(
                    (set) => {
                      if (!set.done)
                        return

                      totalSets += 1

                      const setVolume =
                        set.kg * set.reps

                      sessionVolume +=
                        setVolume

                      totalVolume +=
                        setVolume
                    }
                  )
                }
              )

              if (
                sessionVolume >
                bestSessionVolume
              ) {
                bestSessionVolume =
                  sessionVolume
              }

              return {
                id: session.id,

                completedAt:
                  session.completedAt,

                duration:
                  session.duration,

                volume:
                  sessionVolume,

                sets: totalSets,

                exercises:
                  session.exercises,

                isPR: false,
              }
            }
          )

        const highestVolume =
          Math.max(
            ...calculatedSessions.map(
              (session) =>
                session.volume
            )
          )

        let prAssigned = false

        const sessionsWithPR =
          calculatedSessions.map(
            (session) => {
              const isPR =
                !prAssigned &&
                session.volume ===
                  highestVolume

              if (isPR) {
                prAssigned = true
              }

              return {
                ...session,
                isPR,
              }
            }
          )

        return {
          workoutId,

          workoutName:
            sortedSessions[0]
              .workoutName,

          category:
            workoutData
              ?.category ||

            'Workout',

          sessions:
            sessionsWithPR,

          totalSessions:
            sortedSessions.length,

          totalVolume,

          bestVolume:
            bestSessionVolume,

          lastDuration:
            sortedSessions[0]
              .duration,

          latestCompletedAt:
            sortedSessions[0]
              .completedAt,

          currentPRExercise:
            `${bestSessionVolume}kg`,
        }
      })

      if (
        filters.period !== 'all'
      ) {
        const now = new Date()

        const days =
          filters.period === '7d'
            ? 7
            : filters.period === '30d'
            ? 30
            : 90

        groups = groups.filter(
          (group) => {
            const diff =
              now.getTime() -
              group.latestCompletedAt.getTime()

            return (
              diff <=
              days *
                24 *
                60 *
                60 *
                1000
            )
          }
        )
      }

      if (
        filters.categories.length > 0
      ) {
        groups = groups.filter(
          (group) => {
            const category = (
              group.category || ''
            )
              .toLowerCase()
              .trim()

            return filters.categories.some(
              (selected) =>
                category ===
                selected.toLowerCase()
            )
          }
        )
      }

      if (filters.onlyPR) {
        groups = groups.filter(
          (group) =>
            group.bestVolume > 0
        )
      }

      if (
        filters.duration !== 'any'
      ) {
        groups = groups.filter(
          (group) => {
            const duration =
              group.lastDuration / 60

            if (
              filters.duration ===
              'short'
            ) {
              return duration <= 30
            }

            if (
              filters.duration ===
              'medium'
            ) {
              return (
                duration > 30 &&
                duration <= 60
              )
            }

            return duration > 60
          }
        )
      }

      if (
        filters.orderBy ===
        'volume'
      ) {
        groups.sort(
          (a, b) =>
            b.totalVolume -
            a.totalVolume
        )
      }

      if (
        filters.orderBy ===
        'duration'
      ) {
        groups.sort(
          (a, b) =>
            b.lastDuration -
            a.lastDuration
        )
      }

      if (
        filters.orderBy ===
        'recent'
      ) {
        groups.sort(
          (a, b) =>
            b.latestCompletedAt.getTime() -
            a.latestCompletedAt.getTime()
        )
      }

      return groups
    }, [history, workouts, filters])

  const stats = useMemo(() => {
    const totalSessions =
      groupedHistory.reduce(
        (acc, item) =>
          acc + item.totalSessions,
        0
      )

    const totalVolume =
      groupedHistory.reduce(
        (acc, item) =>
          acc + item.totalVolume,
        0
      )

    return {
      totalSessions,

      workouts:
        groupedHistory.length,

      totalVolume,

      prs:
        groupedHistory.filter(
          (item) =>
            item.bestVolume > 0
        ).length,
    }
  }, [groupedHistory])

  return (
    <Header>
      <div className="flex w-full flex-1 justify-center px-4">
        <div className="flex w-full max-w-5xl flex-col gap-4">

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">

            <Field className="flex flex-col gap-1">

              <FieldDescription className="text-xs font-semibold uppercase tracking-widest">
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
              className="h-10 rounded-full border-border/60 px-5 font-medium"
              onClick={() =>
                setFilterOpen(true)
              }
            >
              <FilterIcon size={15} />

              Filter
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">

              <div className="flex flex-col items-center gap-3 text-muted-foreground">

                <Loader2 className="h-7 w-7 animate-spin" />

                <span className="text-sm">
                  Loading history...
                </span>
              </div>
            </div>
          )}

          {!loading &&
            groupedHistory.length ===
              0 && (
              <div className="flex justify-center py-24">

                <div className="flex flex-col items-center gap-2 text-center">

                  <h2 className="text-lg font-medium">
                    No workouts
                    registered yet
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Start tracking
                    your progress by
                    creating your
                    first workout.
                  </p>
                </div>
              </div>
            )}

          {!loading &&
            groupedHistory.length >
              0 && (
              <>
                <div className="flex flex-col gap-3 md:hidden">

                  <Card className="rounded-3xl border-border/40 bg-card/40 p-5 font-bold">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Total
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {stats.totalSessions}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      sessions registered
                    </p>
                  </Card>

                  <Card className="rounded-3xl border-border/40 bg-card/40 p-5 font-bold">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Volume
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {formatVolume(
                        stats.totalVolume
                      )}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      total lifted
                    </p>
                  </Card>

                  <Card className="rounded-3xl border-none bg-brand-gradient p-5 font-bold text-background">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider opacity-60">
                      Records
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {stats.prs} PRs
                    </h2>

                    <p className="text-sm opacity-60">
                      active workout
                      PRs
                    </p>
                  </Card>
                </div>

                <div className="hidden grid-cols-3 gap-4 font-bold md:grid">

                  <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Total
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {stats.totalSessions}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      sessions registered
                    </p>
                  </Card>

                  <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Volume
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {formatVolume(
                        stats.totalVolume
                      )}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      total lifted
                    </p>
                  </Card>

                  <Card className="rounded-3xl border-none bg-brand-gradient p-5 text-background">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider opacity-60">
                      Records
                    </p>

                    <h2 className="text-4xl tracking-tight">
                      {stats.prs} PRs
                    </h2>

                    <p className="text-sm opacity-60">
                      active workout
                      PRs
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {groupedHistory
                    .slice(
                      0,
                      visibleGroups
                    )
                    .map((workout) => (
                      <HistoryWorkoutCard
                        key={
                          workout.workoutId
                        }
                        workout={workout}
                        onClick={() => {
                          setSelectedWorkout(
                            workout
                          )

                          setWorkoutModalOpen(
                            true
                          )
                        }}
                      />
                    ))}
                </div>

                {groupedHistory.length >
                  10 &&
                  visibleGroups <
                    groupedHistory.length && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() =>
                          setVisibleGroups(
                            (prev) =>
                              prev + 10
                          )
                        }
                      >
                        Load more
                      </Button>
                    </div>
                  )}
              </>
            )}
        </div>
      </div>

      <WorkoutHistoryModal
        workout={selectedWorkout}
        open={workoutModalOpen}
        onOpenChange={
          setWorkoutModalOpen
        }
        onSelectSession={(
          session
        ) => {
          setSelectedGroup(
            selectedWorkout
          )

          setSelectedSession(session)

          setSessionModalOpen(true)
        }}
      />

      {selectedGroup && (
        <SessionHistoryModal
          group={selectedGroup}
          session={selectedSession}
          open={sessionModalOpen}
          onOpenChange={
            setSessionModalOpen
          }
        />
      )}

      <FilterModal
        open={filterOpen}
        onOpenChange={
          setFilterOpen
        }
        filters={filters}
        onApplyFilters={(
          newFilters
        ) => {
          setFilters(newFilters)
          setVisibleGroups(10)
        }}
      />
    </Header>
  )
}

export default History