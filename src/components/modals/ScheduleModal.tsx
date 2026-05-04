import { useState, useEffect } from "react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Modal } from '@/components/Modal'
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, CalendarDays } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { scheduleSchema, type ScheduleFormData } from "@/schemas/scheduleSchema"
import { useAuth } from "@/contexts/AuthContext"
import { getWorkouts, type WorkoutDocument } from "@/services/firebase/workout"
import { createSchedule } from "@/services/firebase/schedule"
import { toast } from "sonner"

const getCurrentTimeDigits = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
}

const TimeInput = ({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) => {
  const [digits, setDigits] = useState(value.replace(":", "") || getCurrentTimeDigits())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.replace(/\D/g, "")
    if (inputVal === "") { setDigits(""); return }
    setDigits(inputVal.slice(-4))
  }

  const handleBlur = () => {
    let padded = digits.padStart(4, "0")
    let hh = Math.min(parseInt(padded.slice(0, 2)), 23)
    let mm = Math.min(parseInt(padded.slice(2, 4)), 59)
    const final = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
    setDigits(`${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}`)
    onChange(final)
  }

  const getDisplayValue = () => {
    if (!digits) return ""
    const padded = digits.padStart(4, "0")
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`
  }

  return (
    <Input
      className={className}
      type="text"
      inputMode="numeric"
      value={getDisplayValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="00:00"
    />
  )
}

interface ScheduleModalProps {
  isModalOpen: boolean
  setIsModalOpen: (v: boolean) => void
  onScheduleCreated?: () => void
}

const ScheduleModal = ({ isModalOpen, setIsModalOpen, onScheduleCreated }: ScheduleModalProps) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutDocument[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    getWorkouts(user.uid).then(setWorkouts)
  }, [user])

  const parseLocalDate = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number)
    const date = new Date(y, m - 1, d)
    date.setHours(12, 0, 0, 0)
    return date
  }

  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  function removeUndefined<T>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj as any)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [
          k,
          v && typeof v === "object" && !Array.isArray(v)
            ? removeUndefined(v)
            : v
        ])
    ) as T
  }

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      workoutId: "",
      time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      notes: "",
      isRecurring: false,
      date: "",
      recurrence: {
        type: "weekly",
        weekdays: [],
        startDate: "",
        endCondition: "never",
      },
    },
  })

  const isRecurring  = form.watch("isRecurring")
  const frequency    = form.watch("recurrence.type")
  const selectedDays = form.watch("recurrence.weekdays") || []
  const endCondition = form.watch("recurrence.endCondition")
  const startDate    = form.watch("date")
  const endDate      = form.watch("recurrence.endDate")
  const recStartDate = form.watch("recurrence.startDate")

  const showStartDate = !isRecurring || (isRecurring && frequency !== "specific_days")
  const showWeekDays  = isRecurring && frequency === "specific_days"

  useEffect(() => {
    if (!isModalOpen) {
      form.reset({
        workoutId: "",
        time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
        notes: "",
        isRecurring: false,
        date: "",
        recurrence: { type: "weekly", weekdays: [], startDate: "", endCondition: "never" },
      })
    }
  }, [isModalOpen])

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('data válida:', data)
    if (!user) return
    const selectedWorkout = workouts.find(w => w.id === data.workoutId)
    if (!selectedWorkout) return

    setSaving(true)
    try {
      const payload: any = {
        uid: user.uid,
        workoutId: data.workoutId,
        workoutName: selectedWorkout.name,
        time: data.time,
        notes: data.notes,
        isRecurring: data.isRecurring,
        date: data.date,
      }

      if (data.isRecurring && data.recurrence) {
        payload.recurrence = {
          type: data.recurrence.type,
          weekdays: data.recurrence.weekdays,
          startDate: data.recurrence.startDate,
          endCondition: data.recurrence.endCondition,
          occurrences: data.recurrence.occurrences
            ? Number(data.recurrence.occurrences)
            : undefined,
          endDate: data.recurrence.endDate,
        }
      }

      console.log("ENVIANDO:", payload)

      await createSchedule(user.uid, removeUndefined(payload))

      toast.success("Workout scheduled!")
      setIsModalOpen(false)
      onScheduleCreated?.()
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error)
      console.error("Code:", error.code)
      console.error("Message:", error.message)
      toast.error("Error scheduling workout.")
    } finally {
      setSaving(false)
    }
  })

  const WEEKDAYS_SHORT = [
    { id: 0, label: 'S' },
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
    { id: 6, label: 'S' },
  ]

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      title='Schedule workout'
      description='Select a workout and define your training schedule.'
      icon={<CalendarDays size={20} />}
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Workout</Label>
          <Select value={form.watch("workoutId")} onValueChange={v => form.setValue("workoutId", v)}>
            <SelectTrigger className="w-full h-11 rounded-lg font-normal">
              <SelectValue placeholder="Select an existing workout" />
            </SelectTrigger>
            <SelectContent>
              {workouts.map(w => (
                <SelectItem key={w.id} value={w.id!}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.workoutId && (
            <p className="text-destructive text-xs">{form.formState.errors.workoutId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {showStartDate && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">{isRecurring ? "Starts on" : "Date"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {isRecurring
                      ? (recStartDate ? format(parseLocalDate(recStartDate), "dd MMM yyyy", { locale: enUS }) : <span className="text-muted-foreground">Date</span>)
                      : (startDate ? format(parseLocalDate(startDate), "dd MMM yyyy", { locale: enUS }) : <span className="text-muted-foreground">Date</span>)
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={isRecurring ? (recStartDate ? parseLocalDate(recStartDate) : undefined) : (startDate ? parseLocalDate(startDate) : undefined)}
                    onSelect={date => {
                      if (!date) return
                      const fixed = new Date(date)
                      fixed.setHours(12, 0, 0, 0)
                      if (isRecurring) {
                        form.setValue("recurrence.startDate", toLocalDateString(fixed))
                      } else {
                        form.setValue("date", toLocalDateString(fixed))
                      }
                    }}
                    fixedWeeks
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-destructive text-xs">{form.formState.errors.date.message}</p>
              )}
            </div>
          )}

          <div className={cn("flex flex-col gap-2", showWeekDays ? "col-span-2" : "col-span-1")}>
            <Label className="text-sm font-medium">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <TimeInput
                className="h-11 rounded-lg pl-9 font-normal"
                value={form.watch("time")}
                onChange={v => form.setValue("time", v)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-border rounded-xl p-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-base font-medium">Repeat workout</Label>
              <span className="text-xs text-muted-foreground">Automatically schedule on a fixed frequency.</span>
            </div>
            <Switch checked={isRecurring} onCheckedChange={val => form.setValue("isRecurring", val)} />
          </div>

          {isRecurring && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border mt-1">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Frequency</Label>
                <Select value={frequency} onValueChange={val => form.setValue("recurrence.type", val as "weekly" | "biweekly" | "specific_days")}>
                  <SelectTrigger className="h-11 rounded-lg font-normal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (same day)</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="specific_days">Specific days of the week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showWeekDays && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Days of the week</Label>
                  <div className="flex items-center justify-between gap-1">
                    {WEEKDAYS_SHORT.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          const updated = selectedDays.includes(day.id)
                            ? selectedDays.filter(d => d !== day.id)
                            : [...selectedDays, day.id]
                          form.setValue("recurrence.weekdays", updated)
                        }}
                        className={cn(
                          "flex-1 h-10 rounded-lg border text-sm transition-all",
                          selectedDays.includes(day.id)
                            ? "bg-primary text-primary-foreground border-primary font-semibold"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.recurrence?.weekdays && (
                    <p className="text-destructive text-xs">{form.formState.errors.recurrence.weekdays.message}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Ends</Label>
                <Select value={endCondition} onValueChange={val => form.setValue("recurrence.endCondition", val as "after_x" | "on_date" | "never")}>
                  <SelectTrigger className="h-11 rounded-lg font-normal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="after_x">After X occurrences</SelectItem>
                    <SelectItem value="on_date">On a specific date</SelectItem>
                  </SelectContent>
                </Select>

                {endCondition === 'after_x' && (
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 10"
                    value={form.watch("recurrence.occurrences") || ""}
                    onChange={e => form.setValue("recurrence.occurrences", e.target.value)}
                    className="w-full max-w-64"
                  />
                )}

                {endCondition === 'on_date' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {endDate ? format(parseLocalDate(endDate), "dd MMM yyyy", { locale: enUS }) : <span className="text-muted-foreground">End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate ? parseLocalDate(endDate) : undefined}
                        onSelect={date => {
                          if (!date) return
                          const fixed = new Date(date)
                          fixed.setHours(12, 0, 0, 0)
                          form.setValue("recurrence.endDate", toLocalDateString(fixed))
                        }}
                        fixedWeeks
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Notes (optional)</Label>
          <Textarea
            placeholder="Focus on form, hydration..."
            className="resize-none min-h-[80px] rounded-xl font-normal"
            {...form.register("notes")}
          />
        </div>
      </div>
    </Modal>
  )
}

export default ScheduleModal