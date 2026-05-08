import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, Timestamp
} from "firebase/firestore"
import { db } from "../firebase"
import { RRule, Weekday } from "rrule"

export interface ScheduleRule {
  id: string
  uid: string
  workoutId: string
  workoutName: string
  time: string
  notes?: string
  isRecurring: boolean
  date?: string
  recurrence?: {
    type: "weekly" | "biweekly" | "specific_days"
    weekdays?: number[]
    startDate?: string
    endCondition: "after_x" | "on_date" | "never"
    occurrences?: number
    endDate?: string
  }
  createdAt: Date
}

export interface GeneratedEvent {
  id: string
  scheduleId: string
  workoutId: string
  date: string
  title: string
  time: string
  status: "scheduled" | "completed" | "rest"
}

const JS_TO_RRULE: Record<number, Weekday> = {
  0: RRule.SU,
  1: RRule.MO,
  2: RRule.TU,
  3: RRule.WE,
  4: RRule.TH,
  5: RRule.FR,
  6: RRule.SA,
}

// Cria data em UTC para evitar o bug de timezone do RRule
const toUTC = (year: number, month: number, day: number, hh = 12, mm = 0): Date => {
  return new Date(Date.UTC(year, month, day, hh, mm, 0))
}

const parseLocalDateUTC = (dateString: string, hh = 12, mm = 0): Date => {
  const [y, m, d] = dateString.split("-").map(Number)
  return toUTC(y, m - 1, d, hh, mm)
}

const toLocalDateString = (date: Date): string => {
  // RRule retorna datas em UTC — usa getUTC* para não ter offset
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const findFirstOccurrenceForDaysOfWeek = (weekdays: number[], time: string): Date => {
  const [hh, mm] = time.split(":").map(Number)
  const now = new Date()
  const todayWeekday = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const targetMinutes = hh * 60 + mm

  const daysFromToday = (day: number) => {
    const diff = (day - todayWeekday + 7) % 7
    if (diff === 0 && targetMinutes <= currentMinutes) return 7
    return diff
  }

  const sortedDays = [...weekdays].sort((a, b) => daysFromToday(a) - daysFromToday(b))
  const targetDay = sortedDays[0]
  const daysUntil = daysFromToday(targetDay)

  const start = new Date()
  start.setDate(start.getDate() + daysUntil)

  return toUTC(start.getFullYear(), start.getMonth(), start.getDate(), hh, mm)
}

export const generateOccurrencesForMonth = (
  rule: ScheduleRule,
  year: number,
  month: number
): GeneratedEvent[] => {
  const monthStart = toUTC(year, month, 1, 0, 0)
  const monthEnd   = toUTC(year, month + 1, 0, 23, 59)

  if (!rule.isRecurring) {
    if (!rule.date) return []
    const eventDate = parseLocalDateUTC(rule.date)
    if (eventDate < monthStart || eventDate > monthEnd) return []
    return [{
      id:         `${rule.id}-single`,
      scheduleId: rule.id,
      workoutId:  rule.workoutId,
      date:       rule.date,
      title:      rule.workoutName,
      time:       rule.time,
      status:     "scheduled",
    }]
  }

  if (!rule.recurrence) return []

  const { type, weekdays, startDate, endCondition, occurrences, endDate } = rule.recurrence
  const [hh, mm] = rule.time.split(":").map(Number)


  const today = new Date()

  let dtstart: Date

  if (type === "specific_days" && weekdays && weekdays.length > 0) {
    if (startDate) {
      dtstart = parseLocalDateUTC(startDate, hh, mm)
    } else {
      dtstart = toUTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hh,
        mm
      )
    }
  } else if (startDate) {
    dtstart = parseLocalDateUTC(startDate, hh, mm)
  } else {
    return []
  }

  let until = new Date(monthEnd)

  if (endCondition === "on_date" && endDate) {
    const end = parseLocalDateUTC(endDate, 23, 59)
    if (end < until) until = end
  }

  const rruleOptions: ConstructorParameters<typeof RRule>[0] = {
    dtstart,
    until,
    tzid: 'UTC',
  }

  if (endCondition === "after_x" && occurrences) {
    rruleOptions.count = occurrences
  }

  if (type === "weekly") {
    rruleOptions.freq     = RRule.WEEKLY
    rruleOptions.interval = 1
  } else if (type === "biweekly") {
    rruleOptions.freq     = RRule.WEEKLY
    rruleOptions.interval = 2
  } else if (type === "specific_days" && weekdays && weekdays.length > 0) {
    rruleOptions.freq      = RRule.WEEKLY
    rruleOptions.interval  = 1
    rruleOptions.byweekday = weekdays.map(d => JS_TO_RRULE[d])
  }

  const rrule = new RRule(rruleOptions)
  const dates = rrule.between(monthStart, monthEnd, true)

  return dates.map((date) => ({
    id: `${rule.id}-${toLocalDateString(date)}`,
    scheduleId: rule.id,
    workoutId:  rule.workoutId,
    date:       toLocalDateString(date),
    title:      rule.workoutName,
    time:       rule.time,
    status:     "scheduled",
  }))
}

export const createSchedule = async (uid: string, data: Omit<ScheduleRule, "id" | "createdAt">): Promise<string> => {
  const ref = await addDoc(collection(db, "schedules"), {
    ...data,
    uid,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export const getSchedules = async (uid: string): Promise<ScheduleRule[]> => {
  const q    = query(collection(db, "schedules"), where("uid", "==", uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    ...(d.data() as Omit<ScheduleRule, "id" | "createdAt">),
    id:        d.id,
    createdAt: d.data().createdAt?.toDate(),
  }))
}

export const deleteSchedule = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "schedules", id))
}