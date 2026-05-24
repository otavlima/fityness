import { useEffect, useId, useMemo, useState } from 'react'
import { Loader2, Trophy } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

import Header from '@/components/Header'
import { Card } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldTitle,
} from '@/components/ui/field'

import { useAuth } from '@/contexts/AuthContext'

import {
  getWorkoutHistory,
  type WorkoutHistoryDocument,
} from '@/services/firebase/workoutHistory'

import {
  getWorkouts,
  type WorkoutDocument,
} from '@/services/firebase/workout'

interface Big4Data {
  title: string
  subtitle: string
  currentValue: number
  data: { value: number }[]
}

interface RecordItem {
  exercise: string
  performance: string
  date: string
}

interface MuscleItem {
  group: string
  percentage: number
}

const CATEGORY_BIG4: Record<
  string,
  {
    title: string
    subtitle: string
  }
> = {
  push: {
    title: 'Push',
    subtitle: 'Chest & Triceps',
  },
  pull: {
    title: 'Pull',
    subtitle: 'Back & Biceps',
  },
  'lower-body': {
    title: 'Lower Body',
    subtitle: 'Legs & Glutes',
  },
  'upper-body': {
    title: 'Upper Body',
    subtitle: 'Shoulders & Arms',
  },
}

const formatDate = (date: Date): string => {
  const diff = Math.floor(
    (new Date().getTime() - date.getTime()) /
      86400000
  )

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const getWeekNumber = (date: Date): string => {
  const d = new Date(date)

  d.setHours(0, 0, 0, 0)

  d.setDate(
    d.getDate() + 3 - ((d.getDay() + 6) % 7)
  )

  const week1 = new Date(
    d.getFullYear(),
    0,
    4
  )

  return `${d.getFullYear()}-W${Math.round(
    (
      (
        d.getTime() - week1.getTime()
      ) /
        86400000 -
      3 +
      ((week1.getDay() + 6) % 7)
    ) /
      7
  )}`
}

const formatCategoryName = (
  category: string
) => {
  return category
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ')
}

const Big4Card = ({
  title,
  subtitle,
  currentValue,
  data,
}: Big4Data) => {
  const uniqueId = useId().replace(/:/g, '')

  const hasData = data.length > 1

  const displayData = hasData
    ? data
    : [{ value: 0 }, { value: 0 }]

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/40 bg-background shadow-none">
      <div className="flex flex-row items-start justify-between p-4 pb-2">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">
            {title}
          </p>

          <p className="text-[11px] text-muted-foreground">
            {subtitle}
          </p>

          <div className="flex items-baseline gap-2 pt-1">
            {currentValue > 0 ? (
              <>
                <span className="text-2xl font-bold tracking-tight">
                  {currentValue}kg
                </span>

                <span className="text-xs text-muted-foreground">
                  average training load
                </span>
              </>
            ) : (
              <span className="text-sm italic text-muted-foreground">
                No data yet
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none h-14 w-full">
        {hasData ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={displayData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${uniqueId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="currentColor"
                    stopOpacity={0.15}
                  />

                  <stop
                    offset="95%"
                    stopColor="currentColor"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={1.5}
                fill={`url(#gradient-${uniqueId})`}
                className="text-foreground/40"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-end px-4 pb-2">
            <div className="h-[2px] w-full rounded-full bg-border/60" />
          </div>
        )}
      </div>
    </Card>
  )
}

const RecentRecordItem = ({
  exercise,
  performance,
  date,
}: RecordItem) => (
  <div className="flex items-center justify-between border-b border-border/40 py-3.5 first:pt-0 last:border-0 last:pb-0">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Trophy className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">
          {exercise}
        </span>

        <span className="text-xs font-medium text-muted-foreground">
          {performance}
        </span>
      </div>
    </div>

    <span className="text-xs font-medium text-muted-foreground">
      {date}
    </span>
  </div>
)

const Progress = () => {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)

  const [allHistory, setAllHistory] =
    useState<
      WorkoutHistoryDocument[]
    >([])

  const [workouts, setWorkouts] =
    useState<
      WorkoutDocument[]
    >([])

  useEffect(() => {
    if (!user) return

    setLoading(true)

    Promise.all([
      (async () => {
        const all: WorkoutHistoryDocument[] =
          []

        let lastDoc: any = undefined

        while (true) {
          const {
            history,
            lastDoc: last,
            hasMore,
          } = await getWorkoutHistory(
            user.uid,
            lastDoc
          )

          all.push(...history)

          if (!hasMore) break

          lastDoc = last
        }

        return all
      })(),

      getWorkouts(user.uid),
    ])
      .then(([history, wks]) => {
        setAllHistory(history)
        setWorkouts(wks)
      })
      .finally(() => setLoading(false))
  }, [user])

  const filtered = allHistory

  const workoutMap = useMemo(
    () =>
      Object.fromEntries(
        workouts.map((w) => [w.id!, w])
      ),
    [workouts]
  )

  const totalVolume = useMemo(() => {
    const kg = filtered.reduce(
      (acc, h) =>
        acc +
        h.exercises.reduce(
          (a, ex) =>
            a +
            ex.sets
              .filter((s) => s.done)
              .reduce(
                (s2, set) =>
                  s2 +
                  (set.kg || 0) *
                    (set.reps || 0),
                0
              ),
          0
        ),
      0
    )

    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`
    }

    return `${Math.round(kg)}kg`
  }, [filtered])

  const consistency = useMemo(() => {
    return new Set(
      filtered.map((h) =>
        getWeekNumber(h.completedAt)
      )
    ).size
  }, [filtered])

  const big4Data = useMemo(
    (): Big4Data[] => {
      const categoryMap: Record<
        string,
        number[]
      > = {}

      const sorted = [...filtered].sort(
        (a, b) =>
          a.completedAt.getTime() -
          b.completedAt.getTime()
      )

      sorted.forEach((h) => {
        const wk =
          workoutMap[h.workoutId]

        if (
          !wk ||
          !CATEGORY_BIG4[wk.category]
        ) {
          return
        }

        const cat = wk.category

        const totalKg =
          h.exercises.reduce(
            (acc, ex) =>
              acc +
              ex.sets
                .filter((s) => s.done)
                .reduce(
                  (sAcc, set) =>
                    sAcc +
                    (set.kg * set.reps),
                  0
                ),
            0
          )

        if (totalKg === 0) return

        if (!categoryMap[cat]) {
          categoryMap[cat] = []
        }

        categoryMap[cat].push(totalKg)
      })

      return Object.entries(
        CATEGORY_BIG4
      ).map(
        ([
          cat,
          {
            title,
            subtitle,
          },
        ]) => {
          const values =
            categoryMap[cat] ?? []

          if (values.length === 0) {
            return {
              title,
              subtitle,
              currentValue: 0,
              data: [],
            }
          }

          const recentValues =
            values.slice(-5)

          const average =
            recentValues.reduce(
              (acc, value) =>
                acc + value,
              0
            ) / recentValues.length

          return {
            title,
            subtitle,
            currentValue:
              Math.round(average),
            data: values.map((v) => ({
              value: v,
            })),
          }
        }
      )
    },
    [filtered, workoutMap]
  )

  const strengthAvg = useMemo(() => {
    const withData = big4Data.filter(
      (b) => b.currentValue > 0
    )

    if (withData.length === 0) {
      return null
    }

    const avg =
      withData.reduce(
        (acc, b) =>
          acc + b.currentValue,
        0
      ) / withData.length

    return `${Math.round(avg)}kg`
  }, [big4Data])

  const recentRecords = useMemo(
    (): RecordItem[] => {
      const map: Record<
        string,
        {
          kg: number
          reps: number
          date: Date
        }
      > = {}

      filtered.forEach((h) => {
        h.exercises.forEach((exercise) => {
          const exerciseName =
            exercise.exerciseName ||
            'Exercise'

          exercise.sets
            .filter(
              (s) => s.done && s.kg > 0
            )
            .forEach((set) => {
              const prev =
                map[exerciseName]

              if (
                !prev ||
                set.kg > prev.kg ||
                (
                  set.kg === prev.kg &&
                  set.reps > prev.reps
                )
              ) {
                map[exerciseName] = {
                  kg: set.kg,
                  reps: set.reps,
                  date: h.completedAt,
                }
              }
            })
        })
      })

      return Object.entries(map)
        .sort(
          ([, a], [, b]) =>
            b.date.getTime() -
            a.date.getTime()
        )
        .slice(0, 5)
        .map(
          ([
            exercise,
            {
              kg,
              reps,
              date,
            },
          ]) => ({
            exercise,
            performance: `${kg}kg × ${reps}`,
            date: formatDate(date),
          })
        )
    },
    [filtered]
  )

  const muscleDistribution = useMemo(
    (): MuscleItem[] => {
      const counts: Record<
        string,
        number
      > = {}

      filtered.forEach((h) => {
        const wk =
          workoutMap[h.workoutId]

        if (!wk) return

        const category =
          wk.category || 'Other'

        counts[category] =
          (counts[category] ?? 0) + 1
      })

      const total = Object.values(
        counts
      ).reduce((a, b) => a + b, 0)

      if (total === 0) return []

      return Object.entries(counts)
        .sort(
          ([, a], [, b]) => b - a
        )
        .map(([group, count]) => ({
          group: formatCategoryName(group),
          percentage: Math.round(
            (count / total) * 100
          ),
        }))
    },
    [filtered, workoutMap]
  )

  return (
    <Header>
      <div className="flex w-full flex-1 justify-center px-4">
        <div className="flex w-full max-w-5xl flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold uppercase tracking-widest">
                Analytics
              </FieldDescription>

              <FieldTitle className="text-3xl font-bold tracking-tight">
                Progress
              </FieldTitle>

              <FieldDescription>
                Track your load progression and consistency.
              </FieldDescription>
            </Field>
          </div>

          {loading ? (
            <div className="flex flex-1 w-full items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />

                <span className="text-sm font-medium">
                  Loading progress...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 font-bold md:grid-cols-3">
                <Card className="rounded-3xl border-none bg-foreground p-5 text-background">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider opacity-60">
                    Strength (Big 4)
                  </p>

                  <h2 className="text-4xl tracking-tight">
                    {strengthAvg ?? '—'}
                  </h2>

                  <p className="mt-1 text-sm font-medium opacity-60">
                    average training load
                  </p>
                </Card>

                <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Volume
                  </p>

                  <h2 className="text-4xl tracking-tight">
                    {filtered.length > 0
                      ? totalVolume
                      : '—'}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    training volume
                  </p>
                </Card>

                <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Consistency
                  </p>

                  <h2 className="text-4xl tracking-tight">
                    {filtered.length > 0
                      ? consistency
                      : '—'}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    weeks trained
                  </p>
                </Card>
              </div>

              <Card className="space-y-6 rounded-3xl border-border/40 bg-card/40 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Big 4 — Loads
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {big4Data.map((b, i) => (
                    <Big4Card
                      key={i}
                      {...b}
                    />
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="flex flex-col gap-6 rounded-3xl border-border/40 bg-card/40 p-6">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Recent Records
                  </h3>

                  {recentRecords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No records yet. Complete a workout to see your PRs.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {recentRecords.map(
                        (r, i) => (
                          <RecentRecordItem
                            key={i}
                            {...r}
                          />
                        )
                      )}
                    </div>
                  )}
                </Card>

                <Card className="flex flex-col gap-6 rounded-3xl border-border/40 bg-card/40 p-6">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Muscle Distribution
                  </h3>

                  {muscleDistribution.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No data yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {muscleDistribution.map(
                        (item, i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-foreground/90">
                                {item.group}
                              </span>

                              <span className="font-medium text-muted-foreground">
                                {item.percentage}%
                              </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                              <div
                                className="h-full rounded-full bg-foreground"
                                style={{
                                  width: `${item.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Progress