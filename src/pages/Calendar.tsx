import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"

export type WorkoutStatus = 'completed' | 'scheduled' | 'rest'

export interface WorkoutEvent {
  id: string
  date: string 
  title: string
  status: WorkoutStatus
}

type CalendarDay = {
  day: number
  isOtherMonth: boolean
  dateString?: string
  events?: WorkoutEvent[]
}

const MOCK_EVENTS: WorkoutEvent[] = [
  { id: '1', date: '2026-04-01', title: 'Push', status: 'completed' },
  { id: '2', date: '2026-04-02', title: 'Pull', status: 'completed' },
  { id: '3', date: '2026-04-03', title: 'Rest', status: 'rest' },
  { id: '4', date: '2026-04-04', title: 'Legs', status: 'completed' },
  { id: '18', date: '2026-04-18', title: 'Push', status: 'scheduled' },
]

const frequencyData = [
  { month: "J", total: 12 }, { month: "F", total: 18 }, { month: "M", total: 15 },
  { month: "A", total: 22 }, { month: "M", total: 20 }, { month: "J", total: 14 },
  { month: "J", total: 25 }, { month: "A", total: 19 }, { month: "S", total: 12 },
  { month: "O", total: 21 }, { month: "N", total: 28 }, { month: "D", total: 10 },
]

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1))
  const [events] = useState<WorkoutEvent[]>(MOCK_EVENTS)
  const today = new Date(2026, 3, 18)

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const prefixDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
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
        isOtherMonth: false
      })
    }
    const totalCells = 42
    const suffixDaysCount = totalCells - daysArray.length
    for (let i = 1; i <= suffixDaysCount; i++) {
      daysArray.push({ day: i, isOtherMonth: true })
    }
    return daysArray
  }, [currentDate, events])

  const visibleDays = useMemo<CalendarDay[]>(() => {
    const lastWeek = calendarDays.slice(35, 42)
    const onlyNextMonth = lastWeek.every(day => day.isOtherMonth)
    return onlyNextMonth ? calendarDays.slice(0, 35) : calendarDays
  }, [calendarDays])

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">Planning</FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">Calendar</FieldTitle>
              <FieldDescription>Schedule your workouts and track your frequency.</FieldDescription>
            </Field>
            <Button className="w-full sm:w-auto gap-2">
              <Plus size={18} strokeWidth={3} /> New schedule
            </Button>
          </div>
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full">
                    <ChevronLeft size={20} />
                  </Button>
                  <h2 className="text-lg font-bold min-w-[140px] text-center">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full">
                    <ChevronRight size={20} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mt-4 sm:mt-0">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Concluído</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-muted-foreground" /> Agendado</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted" /> Descanso</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-b border-border bg-muted/20">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-muted-foreground py-3 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 bg-border gap-px">
                {visibleDays.map((dayObj, index) => {
                  const isToday = !dayObj.isOtherMonth && dayObj.day === today.getDate() && currentDate.getMonth() === today.getMonth();
                  return (
                    <div key={index} className={`bg-card min-h-[120px] p-2 flex flex-col gap-1 transition-colors ${dayObj.isOtherMonth ? 'bg-muted/30' : 'hover:bg-muted/10'}`}>
                      <div className="flex justify-start">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full 
                          ${isToday ? 'bg-primary text-primary-foreground' : dayObj.isOtherMonth ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                          {dayObj.day}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {!dayObj.isOtherMonth && dayObj.events?.map(event => (
                          <div key={event.id} className={`flex items-center gap-1.5 w-full text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tight
                            ${event.status === 'completed' ? 'bg-primary text-primary-foreground border-transparent' : 
                              event.status === 'scheduled' ? 'bg-transparent border-border text-foreground' : 'bg-muted/50 text-muted-foreground border-transparent'}`}>
                            {event.status === 'completed' && <Check size={12} strokeWidth={4} />}
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Upcoming Workouts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { day: '19', label: 'SUN', title: 'Push Day', time: '18:30' },
                  { day: '20', label: 'MON', title: 'Pull Day', time: '10:00' },
                  { day: '21', label: 'TUE', title: 'Legs Day', time: '09:00' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center bg-muted/50 px-3 py-1 rounded-lg min-w-[52px]">
                        <span className="text-[10px] font-black text-muted-foreground">{item.label}</span>
                        <span className="text-lg font-black leading-tight">{item.day}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.title}</span>
                        <span className="text-xs text-muted-foreground font-semibold">{item.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-bold px-4 h-8">
                      Reschedule
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Monthly Frequency</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frequencyData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                      <XAxis 
                        dataKey="month" 
                        stroke="var(--muted-foreground)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        fontWeight="900"
                        dy={10}
                        interval={0}
                      />
                      <Tooltip 
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border p-2 rounded-lg shadow-md">
                                <p className="text-xs font-bold text-popover-foreground">{`${payload[0].value} workouts`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="total" 
                        fill="var(--primary)" 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground font-medium">
                    Average: <span className="text-foreground font-black">4.7 workouts/week</span>
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Header>
  )
}

export default Calendar