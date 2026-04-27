import { useState } from "react"
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
import { useEffect } from "react"

const getCurrentTimeDigits = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}${mm}`
}

const TimeInput = ({ className }: { className?: string }) => {
  const [digits, setDigits] = useState(getCurrentTimeDigits())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.replace(/\D/g, "")
    if (inputVal === "") {
      setDigits("")
      return
    }
    const newDigits = inputVal.slice(-4)
    setDigits(newDigits)
  }

  const handleBlur = () => {
    if (digits === "") {
      setDigits("0000")
      return
    }
    let padded = digits.padStart(4, "0")
    let hh = parseInt(padded.slice(0, 2))
    let mm = parseInt(padded.slice(2, 4))

    if (hh > 23) hh = 23
    if (mm > 59) mm = 59

    setDigits(`${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}`)
  }

  const getDisplayValue = () => {
    if (digits === "") return ""
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

const ScheduleModal = ({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: "",
      date: "",
      status: "scheduled",
      isRecurring: false,
      recurrence: {
        type: "weekly",
        weekdays: [],
        startDate: "",
        endCondition: "never",
      },
    },
  })
  const startDate = form.watch("date")
  const endDate = form.watch("recurrence.endDate")
  const startDateValue = startDate ? new Date(startDate) : undefined
  const endDateValue = endDate ? new Date(endDate) : undefined
  const isRepeating = form.watch("isRecurring")
  const frequency = form.watch("recurrence.type")
  const selectedDays = form.watch("recurrence.weekdays") || []
  const endCondition = form.watch("recurrence.endCondition")

  const showStartDate =
    !isRepeating || (isRepeating && frequency !== "specific_days")
  const showWeekDays =
    isRepeating && frequency === "specific_days"

  useEffect(() => {
    if (!isModalOpen) {
      form.reset({
        title: "",
        date: "",
        status: "scheduled",
        isRecurring: false,
        recurrence: {
          type: "weekly",
          weekdays: [],
          startDate: "",
          endCondition: "never",
        },
      })
    }
  }, [isModalOpen])

  const WEEKDAYS_SHORT = [
    { id: '0', label: 'S' }, { id: '1', label: 'M' }, { id: '2', label: 'T' },
    { id: '3', label: 'W' }, { id: '4', label: 'T' }, { id: '5', label: 'F' }, { id: '6', label: 'S' }
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
          <Button
           onClick={form.handleSubmit((data) => {
            const parsed = {
              ...data,
              recurrence: data.recurrence
                ? {
                    ...data.recurrence,
                    occurrences: data.recurrence.occurrences
                      ? Number(data.recurrence.occurrences)
                      : undefined,
                  }
                : undefined,
            }

            console.log(parsed)
            setIsModalOpen(false)
          })}
          >
            Schedule
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Workout</Label>
          <Select>
            <SelectTrigger className="w-full h-11 rounded-lg font-normal">
              <SelectValue placeholder="Select an existing workout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="push">Push Day</SelectItem>
              <SelectItem value="pull">Pull Day</SelectItem>
              <SelectItem value="legs">Legs Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {showStartDate && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">{isRepeating ? "Starts on" : "Date"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: enUS }) : <span>Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDateValue}
                    onSelect={(date) =>
                      form.setValue("date", format(date!, "yyyy-MM-dd"))
                    }
                    fixedWeeks
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div className={cn("flex flex-col gap-2", showWeekDays ? "col-span-2" : "col-span-1")}>
            <Label className="text-sm font-medium">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <TimeInput className="h-11 rounded-lg pl-9 font-normal" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 border border-border rounded-xl p-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-base font-medium">Repeat workout</Label>
              <span className="text-xs text-muted-foreground">Automatically schedule on a fixed frequency.</span>
            </div>
            <Switch
              checked={isRepeating}
              onCheckedChange={(val) => form.setValue("isRecurring", val)}
            />
          </div>
          {isRepeating && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border mt-1">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(val) =>
                    form.setValue("recurrence.type", val as any)
                  }
                >
                  <SelectTrigger className="h-11 rounded-lg font-normal">
                    <SelectValue />
                  </SelectTrigger>
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
                    {WEEKDAYS_SHORT.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          const current = selectedDays
                          const updated = current.includes(Number(day.id))
                            ? current.filter(d => d !== Number(day.id))
                            : [...current, Number(day.id)]

                          form.setValue("recurrence.weekdays", updated)
                        }}
                        className={cn(
                          "flex-1 h-10 rounded-lg border text-sm transition-all",
                          selectedDays.includes(Number(day.id)) ? "bg-primary text-primary-foreground border-primary font-semibold" : "bg-background text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Ends</Label>
                <Select
                  value={endCondition}
                  onValueChange={(val) =>
                    form.setValue("recurrence.endCondition", val as any)
                  }
                >
                  <SelectTrigger className="h-11 rounded-lg font-normal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="after_x">After X occurrences</SelectItem>
                    <SelectItem value="on_date">On a specific date</SelectItem>
                  </SelectContent>
                </Select>
                {endCondition === 'after_x' && (
                  <Input
                    type="text"
                    value={form.watch("recurrence.occurrences") || ""}
                    onChange={(e) =>
                      form.setValue("recurrence.occurrences", e.target.value)
                    }
                    className="w-full max-w-64"
                  />
                )}
                {endCondition === 'on_date' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {endDate ? format(endDate, "dd MMM yyyy", { locale: enUS }) : <span>End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDateValue}
                        onSelect={(date) =>
                          form.setValue("recurrence.endDate", format(date!, "yyyy-MM-dd"))
                        }
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
          <Textarea placeholder="Focus on form, hydration..." className="resize-none min-h-[80px] rounded-xl font-normal" />
        </div>
      </div>
    </Modal>
  )
}

export default ScheduleModal