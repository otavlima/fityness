import { useState, useMemo, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts"
import { cn } from "@/lib/utils"
import { useTranslation } from 'react-i18next'
import ScheduleModal from '@/components/modals/ScheduleModal'
import DialogSchedules from '@/components/DialogSchedules'
import { getSchedules, generateOccurrencesForMonth, type ScheduleRule } from '@/services/firebase/schedule'
import { useAuth } from '@/contexts/AuthContext'
import ScheduleDialog from '@/components/ScheduleDialog'
import {
  getCompletedEventIds,
  markEventCompleted,
  unmarkEventCompleted,
} from '@/services/firebase/scheduleStatus'

export type WorkoutStatus = 'completed' | 'scheduled'

export interface WorkoutEvent {
  id: string
  scheduleId: string
  date: string
  title: string
  time: string
  status: WorkoutStatus
}

type CalendarDay = {
  day: number
  isOtherMonth: boolean
  dateString?: string
  events?: WorkoutEvent[]
}

const Calendar = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const today    = new Date()
  const [isMobile, setIsMobile] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [schedules, setSchedules] = useState<ScheduleRule[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<WorkoutEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<WorkoutEvent | null>(null)

  const WEEKDAYS = useMemo(() => t('calendar.weekdays', { returnObjects: true }) as string[], [t])
  const MONTHS   = useMemo(() => t('calendar.months', { returnObjects: true }) as string[], [t])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 526)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadSchedules = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const [data, completed] = await Promise.all([
        getSchedules(user.uid),
        getCompletedEventIds(user.uid),
      ])

      setSchedules(data)
      setCompletedIds(new Set(completed))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadSchedules() }, [loadSchedules])

  const handleOpenDetail = (event: WorkoutEvent) => {
    setSelectedDetailEvent(event)
    setIsDetailOpen(true)
  }

  const handleDeleted = useCallback((scheduleId: string) => {
    setSchedules(old => old.filter(s => s.id !== scheduleId))
    setIsDetailOpen(false)
    setSelectedDetailEvent(null)
  }, [])

  const handleCompleted = useCallback(async (event: WorkoutEvent) => {
    if (!user) return

    const alreadyCompleted = completedIds.has(event.id)

    setCompletedIds(old => {
      const next = new Set(old)

      if (alreadyCompleted) {
        next.delete(event.id)
      } else {
        next.add(event.id)
      }

      return next
    })

    try {
      if (alreadyCompleted) {
        await unmarkEventCompleted(user.uid, event.id)
      } else {
        await markEventCompleted(
          user.uid,
          event.id,
          event.scheduleId
        )
      }
    } catch {
      setCompletedIds(old => {
        const next = new Set(old)

        if (alreadyCompleted) {
          next.add(event.id)
        } else {
          next.delete(event.id)
        }

        return next
      })
    }
  }, [user, completedIds])

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const events = useMemo<WorkoutEvent[]>(() => {
    const year  = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return schedules.flatMap(rule =>
      generateOccurrencesForMonth(rule, year, month).map(e => ({
        id:         e.id,
        scheduleId: e.scheduleId,
        date:       e.date,
        title:      e.title,
        time:       e.time,
        status:     completedIds.has(e.id) ? 'completed' : 'scheduled' as WorkoutStatus,
      }))
    )
  }, [schedules, currentDate, completedIds])

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year  = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const prefixDaysCount = firstDayOfMonth
    const daysInMonth     = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const daysArray: CalendarDay[] = []

    for (let i = prefixDaysCount - 1; i >= 0; i--) {
      daysArray.push({ day: daysInPrevMonth - i, isOtherMonth: true })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      daysArray.push({
        day: i,
        dateString,
        events: events.filter(e => e.date === dateString),
        isOtherMonth: false,
      })
    }

    while (daysArray.length < 42) {
      daysArray.push({ day: daysArray.length - daysInMonth - prefixDaysCount + 1, isOtherMonth: true })
    }

    return daysArray
  }, [currentDate, events])

  const visibleDays = useMemo<CalendarDay[]>(() => {
    const lastWeek = calendarDays.slice(35, 42)
    return lastWeek.every(d => d.isOtherMonth) ? calendarDays.slice(0, 35) : calendarDays
  }, [calendarDays])

  const frequencyData = useMemo(() => {
    const months = [
      'J', 'F', 'M', 'A', 'M', 'J',
      'J', 'A', 'S', 'O', 'N', 'D'
    ]

    const year = currentDate.getFullYear()

    return months.map((monthLabel, monthIndex) => {
      let total = 0

      for (const rule of schedules) {
        const occurrences = generateOccurrencesForMonth(
          rule,
          year,
          monthIndex
        )

        total += occurrences.length
      }

      return {
        month: monthLabel,
        total,
      }
    })
  }, [schedules, currentDate])

  const upcomingWorkouts = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return events
      .filter(e => e.date >= todayStr && e.status !== 'completed')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 3)
  }, [events])

  useEffect(() => {
    if (!selectedDetailEvent) return
    const updated = events.find(e => e.id === selectedDetailEvent.id)
    if (updated) setSelectedDetailEvent(updated)
  }, [completedIds, events, selectedDetailEvent])

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">{t('calendar.planning')}</FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">{t('calendar.title')}</FieldTitle>
              <FieldDescription>{t('calendar.description')}</FieldDescription>
            </Field>
            <Button className="w-full sm:w-auto rounded-full gap-2 px-6" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} strokeWidth={2} /> {t('calendar.newSchedule')}
            </Button>
          </div>

          <ScheduleModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onScheduleCreated={loadSchedules}
          />

          <DialogSchedules
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            events={selectedEvents}
            date={selectedDate}
            onOpenDetail={handleOpenDetail}
          />

          <ScheduleDialog
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            event={selectedDetailEvent}
            schedules={schedules}
            onDeleted={handleDeleted}
            onCompleted={handleCompleted}
          />

          {loading ? (
            <div className="flex flex-1 w-full justify-center items-center py-24">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">
                  {t('calendar.loading')}
                </span>
              </div>
            </div>
          ) : (
            <>
              <Card className="overflow-hidden border-border shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full"><ChevronLeft size={20} /></Button>
                    <h2 className="text-lg min-w-[140px] text-center font-semibold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full"><ChevronRight size={20} /></Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 sm:mt-0">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> {t('calendar.legend.completed')}</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-muted-foreground bg-transparent" /> {t('calendar.legend.scheduled')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-b border-border bg-muted/10">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-[10px] text-muted-foreground py-3 uppercase tracking-widest font-bold">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 bg-border gap-px">
                  {visibleDays.map((dayObj, index) => {
                    const isToday =
                      !dayObj.isOtherMonth &&
                      dayObj.day === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear()
                    
                    const hasEvents = dayObj.events && dayObj.events.length > 0

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (!isMobile || dayObj.isOtherMonth || !hasEvents) return

                          if (dayObj.events!.length === 1) {
                            handleOpenDetail(dayObj.events![0])
                          } else {
                            setSelectedEvents(dayObj.events!)
                            setSelectedDate(dayObj.dateString)
                            setIsDialogOpen(true)
                          }
                        }}
                        className={cn(
                          "bg-card min-h-[70px] min-[464px]:min-h-[110px] p-1.5 min-[464px]:p-2 flex flex-col gap-1 transition-colors",
                          dayObj.isOtherMonth ? 'bg-muted/20 opacity-40' : 'hover:bg-muted/5',
                          isMobile && hasEvents && !dayObj.isOtherMonth ? "cursor-pointer active:bg-muted/10" : ""
                        )}
                      >
                        <div className="flex justify-center min-[464px]:justify-start">
                          <span className={cn(
                            "text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium",
                            isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                          )}>
                            {dayObj.day}
                          </span>
                        </div>

                        {!dayObj.isOtherMonth && hasEvents && (
                          <>
                            <div className="hidden min-[464px]:flex flex-col gap-1 w-full">
                              {dayObj.events!.slice(0, 1).map(event => (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenDetail(event)
                                  }}
                                  className={cn(
                                    "cursor-pointer flex items-center gap-1.5 w-full text-[10px] px-3 py-1.5 rounded-full border uppercase tracking-tight font-bold",
                                    event.status === 'completed'
                                      ? 'bg-primary text-primary-foreground border-transparent'
                                      : 'bg-muted border-border text-foreground'
                                  )}
                                >
                                  {event.status === 'completed' && <Check size={12} strokeWidth={3} />}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              ))}
                              {dayObj.events!.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEvents(dayObj.events!)
                                    setSelectedDate(dayObj.dateString)
                                    setIsDialogOpen(true)
                                  }}
                                  className="w-full text-[10px] px-3 py-1.5 rounded-full border border-dashed border-border text-muted-foreground font-bold hover:bg-muted/40 transition"
                                >
                                  {t('calendar.more', { count: dayObj.events!.length - 1 })}
                                </button>
                              )}
                            </div>
                            <div className="flex min-[464px]:hidden flex-wrap justify-center items-center gap-1 mt-1 w-full px-1">
                              {dayObj.events!.map(event => (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    event.status === 'completed'
                                      ? "bg-primary"
                                      : "border border-muted-foreground bg-transparent"
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle className="text-lg font-bold">{t('calendar.upcoming.title')}</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {upcomingWorkouts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('calendar.upcoming.empty')}</p>
                    ) : (
                      upcomingWorkouts.map((event, i) => {
                        const date = new Date(event.date + "T12:00:00")
                        return (
                          <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center bg-muted/40 px-3 py-1 rounded-lg min-w-[52px]">
                                <span className="text-[10px] text-muted-foreground font-bold">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-lg leading-tight font-bold">{date.getDate()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{event.title}</span>
                                <span className="text-xs text-muted-foreground font-medium">{event.time}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
                <Card className="shadow-sm flex flex-col">
                  <CardHeader><CardTitle className="text-lg font-bold">{t('calendar.frequency.title')}</CardTitle></CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="h-[160px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={frequencyData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} dy={10} interval={0} fontWeight="bold" />
                          <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground font-medium" dangerouslySetInnerHTML={{
                        __html: t('calendar.frequency.average', {
                          count: (frequencyData.reduce((acc, curr) => acc + curr.total, 0) / 52).toFixed(1)
                        })
                      }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Calendar