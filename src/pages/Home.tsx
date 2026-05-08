import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import {
  Play,
  ArrowRight,
  Flame,
  Trophy,
  Dumbbell,
  TrendingUp,
  Timer,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import {
  getSchedules,
  generateOccurrencesForMonth,
  type ScheduleRule,
} from '@/services/firebase/schedule'

import {
  getCompletedEventIds,
} from '@/services/firebase/scheduleStatus'

import {
  getWorkout,
  type WorkoutDocument,
} from '@/services/firebase/workout'

const Home = () => {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)

  const [schedules, setSchedules] = useState<ScheduleRule[]>([])

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const [todayWorkout, setTodayWorkout] =
    useState<WorkoutDocument | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return

      setLoading(true)

      try {
        const [scheduleData, completedData] = await Promise.all([
          getSchedules(user.uid),
          getCompletedEventIds(user.uid),
        ])

        setSchedules(scheduleData)
        setCompletedIds(new Set(completedData))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const today = new Date()

  const allEvents = useMemo(() => {
    const events: ReturnType<
      typeof generateOccurrencesForMonth
    > = []

    for (let offset = -2; offset <= 2; offset++) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() + offset,
        1
      )

      for (const rule of schedules) {
        events.push(
          ...generateOccurrencesForMonth(
            rule,
            date.getFullYear(),
            date.getMonth()
          )
        )
      }
    }

    return events
  }, [schedules])

  const currentMonthEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(
        event.date + 'T00:00:00'
      )

      return (
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      )
    })
  }, [allEvents, today])

  const completedMonthEvents = useMemo(() => {
    return currentMonthEvents.filter(event =>
      completedIds.has(event.id)
    )
  }, [currentMonthEvents, completedIds])

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const todayEvent = useMemo(() => {
    return allEvents.find(
      event => event.date === todayString
    )
  }, [allEvents, todayString])

  useEffect(() => {
    if (!todayEvent) {
      setTodayWorkout(null)
      return
    }

    getWorkout(todayEvent.workoutId)
      .then(setTodayWorkout)
  }, [todayEvent])

  const metrics = useMemo(() => {
    return [
      {
        icon: Dumbbell,
        badge: `${completedMonthEvents.length} done`,
        value: String(currentMonthEvents.length),
        label: 'Workouts this month',
      },
      {
        icon: TrendingUp,
        badge: '+8%',
        value: '12.4t',
        label: 'Total volume',
      },
      {
        icon: Flame,
        badge: 'Record!',
        value: '12d',
        label: 'Active streak',
      },
      {
        icon: Timer,
        badge: '-3m',
        value: '54m',
        label: 'Average time',
      },
    ]
  }, [currentMonthEvents, completedMonthEvents])

  const monthStats = useMemo(() => {
    return {
      total: currentMonthEvents.length,
      completed: completedMonthEvents.length,
    }
  }, [currentMonthEvents, completedMonthEvents])

  const todayExercises = useMemo(() => {
    if (!todayWorkout) return []

    return todayWorkout.exercises.map((ex, index) => ({
      id: index + 1,
      name: ex.name,
      detail: `${ex.sets} × ${ex.reps}`,
      increment: '+0kg',
    }))
  }, [todayWorkout])

  const recentActivity = useMemo(() => {
    const completedEvents = completedMonthEvents
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        )
      })
      .slice(0, 3)

    return completedEvents.map(event => ({
      title: event.title,
      time: '~55m',
      vol: 'Completed',
      date: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(`${event.date}T00:00:00`)),
    }))
  }, [completedMonthEvents])

  if (loading) {
    return (
      <Header>
        <div className="flex justify-center items-center py-20">
          <Loader2
            className="animate-spin text-muted-foreground"
            size={32}
          />
        </div>
      </Header>
    )
  }

  return (
    <Header>
      <div className="flex flex-col w-full px-4 md:px-10 gap-8">
        <Card className="relative w-full bg-card-gradient border-border shadow-lg rounded-[2.5rem] overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_top_right,var(--foreground),transparent)]" />

          <CardContent className="p-8 md:p-12 flex flex-col gap-8 relative z-10">
            <div className="flex items-center bg-primary/10 border border-primary/20 p-2 px-4 w-fit rounded-full">
              <span className="flex items-center gap-2 text-[11px] text-primary font-bold tracking-widest uppercase">
                <Flame className="w-4 h-4 fill-current text-orange-400" />
                Streak 12 Days
              </span>
            </div>

            <div className="space-y-4 lg:pr-[300px]">
              <h1 className="text-foreground text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                Morning, {user?.displayName}.
                <br />

                <span className="text-muted-foreground">
                  {todayEvent
                    ? `Today's workout is ${todayEvent.title}.`
                    : 'Today is a rest day.'}
                </span>
              </h1>

              <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-[500px]">
                {todayWorkout
                  ? `${todayWorkout.exercises.length} exercises · ~55 minutes estimated.`
                  : 'Recover, hydrate and get ready for the next workout.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="default">
                <Play className="fill-current w-4 h-4 mr-2" />
                Start Workout
              </Button>

              <Button size="lg" variant="outline">
                View monthly plan
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="relative lg:absolute lg:bottom-12 lg:right-12 mt-4 lg:mt-0 w-full lg:w-[260px]">
              <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                    This Month
                  </span>

                  <Trophy className="w-5 h-5 text-yellow-500/80" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground tracking-tighter">
                    {monthStats.completed}
                  </span>

                  <span className="text-base font-medium text-muted-foreground">
                    / {monthStats.total} completed
                  </span>
                </div>

                <div className="flex gap-1.5 mt-6">
                  {[
                    ...Array(Math.max(monthStats.total, 1)),
                  ].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < monthStats.completed
                          ? 'bg-primary'
                          : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col w-full gap-4 md:grid md:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="w-full rounded-[1.8rem] bg-card border border-border shadow-sm"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 rounded-2xl">
                    <metric.icon className="w-5 h-5 text-foreground" />
                  </div>

                  <span className="bg-secondary/80 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {metric.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-4xl font-bold tracking-tighter text-foreground">
                    {metric.value}
                  </h3>

                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    {metric.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[2.5rem] border-border bg-card shadow-sm">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                    Today's Workout
                  </span>

                  <h2 className="text-3xl font-bold mt-2">
                    {todayEvent?.title || 'Rest Day'}
                  </h2>
                </div>

                <div className="bg-secondary/50 px-4 py-1.5 rounded-full text-xs font-bold border border-border">
                  {todayWorkout
                    ? `${todayWorkout.exercises.length} Exercises`
                    : 'Recovery'}
                </div>
              </div>

              <div className="space-y-3">
                {todayExercises.length === 0 ? (
                  <div className="flex items-center justify-center h-[240px] rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-medium">
                    No workout scheduled for today.
                  </div>
                ) : (
                  todayExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-sm border border-border">
                          {ex.id}
                        </div>

                        <div>
                          <p className="font-bold text-sm">
                            {ex.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {ex.detail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                          {ex.increment}
                        </span>

                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-border bg-card shadow-sm flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col">
              <div className="flex items-center mb-8">
                <h2 className="text-xl font-bold">
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-8 flex-1">
                {recentActivity.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="relative pl-6 border-l-2 border-muted/20 last:border-0 pb-2"
                    >
                      <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-foreground" />

                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm leading-none">
                          {item.title}
                        </p>

                        <span className="text-[10px] text-muted-foreground">
                          {item.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                        <span>{item.time}</span>

                        <span>•</span>

                        <span>{item.vol}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/workouts"
                className="flex items-center justify-center gap-2 w-full mt-8 border-dashed rounded-2xl h-14 border-2 hover:bg-secondary/50 transition-colors"
              >
                <Dumbbell size={16} />
                Manage workouts
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Header>
  )
}

export default Home