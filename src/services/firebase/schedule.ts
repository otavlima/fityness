import {
  collection, addDoc, getDocs, writeBatch,
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

const toUTC = (year: number, month: number, day: number, hh = 12, mm = 0): Date => {
  return new Date(Date.UTC(year, month, day, hh, mm, 0))
}

const parseLocalDateUTC = (dateString: string, hh = 12, mm = 0): Date => {
  const [y, m, d] = dateString.split("-").map(Number)
  return toUTC(y, m - 1, d, hh, mm)
}

const toLocalDateString = (date: Date): string => {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
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
    rruleOptions.freq = RRule.WEEKLY
    rruleOptions.interval = 1
  } else if (type === "biweekly") {
    rruleOptions.freq = RRule.WEEKLY
    rruleOptions.interval = 2
  } else if (type === "specific_days" && weekdays && weekdays.length > 0) {
    rruleOptions.freq = RRule.WEEKLY
    rruleOptions.interval = 1
    rruleOptions.byweekday = weekdays.map(d => JS_TO_RRULE[d])
  }

  const rrule = new RRule(rruleOptions)
  const dates = rrule.between(monthStart, monthEnd, true)

  return dates.map((date) => ({
    id: `${rule.id}-${toLocalDateString(date)}`,
    scheduleId: rule.id,
    workoutId: rule.workoutId,
    date: toLocalDateString(date),
    title: rule.workoutName,
    time: rule.time,
    status: "scheduled",
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

export const deleteSchedule = async (uid: string, id: string): Promise<void> => {
  const batch = writeBatch(db)

  batch.delete(doc(db, "schedules", id))

  const statusSnap = await getDocs(
    query(
      collection(db, "schedule_status"),
      where("uid", "==", uid),
      where("scheduleId", "==", id)
    )
  )

  statusSnap.docs.forEach(d => batch.delete(d.ref))

  await batch.commit()
}

export const updateScheduleWorkoutName = async (
  uid: string,
  workoutId: string,
  newName: string
): Promise<void> => {
  const q    = query(collection(db, "schedules"), where("uid", "==", uid), where("workoutId", "==", workoutId))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { workoutName: newName }))
  await batch.commit()
}