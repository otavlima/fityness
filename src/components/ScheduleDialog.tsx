import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Clock,
  Timer,
  Dumbbell,
  RotateCcw,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type WorkoutEvent } from "@/pages/Calendar"
import {
  type ScheduleRule,
  deleteSchedule,
} from "@/services/firebase/schedule"
import {
  getWorkout,
  type WorkoutDocument,
} from "@/services/firebase/workout"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface ScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  event: WorkoutEvent | null
  schedules: ScheduleRule[]
  onDeleted?: (scheduleId: string) => void
  onCompleted: (event: WorkoutEvent) => void
}

const formatRecurrence = (rule: ScheduleRule): string => {
  if (!rule.isRecurring) return "Once"

  const r = rule.recurrence
  if (!r) return "Once"
  if (r.type === "weekly") return "Weekly"
  if (r.type === "biweekly") return "Every 2 weeks"

  if (r.type === "specific_days" && r.weekdays && r.weekdays.length > 0) {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const sortedDays = [...r.weekdays].sort((a, b) => a - b)
    
    if (sortedDays.length === 7) return "Every day"

    const parts: string[] = []
    let i = 0

    while (i < sortedDays.length) {
      let j = i
      
      while (j + 1 < sortedDays.length && sortedDays[j + 1] === sortedDays[j] + 1) {
        j++
      }

      if (j - i >= 2) {
        parts.push(`${names[sortedDays[i]]} - ${names[sortedDays[j]]}`)
        i = j + 1
      } else {
        parts.push(names[sortedDays[i]])
        i++
      }
    }

    return parts.join(', ')
  }

  return "Once"
}

const formatDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-").map(Number)

  const date = new Date(y, m - 1, d)

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const ScheduleDialog = ({
  isOpen,
  onClose,
  event,
  schedules,
  onDeleted,
  onCompleted,
}: ScheduleDialogProps) => {
  const [workout, setWorkout] = useState<WorkoutDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  const schedule = event
    ? schedules.find(s => s.id === event.scheduleId)
    : null

  useEffect(() => {
    setWorkout(null)

    if (!event || !schedule) {
      setLoading(false)
      return
    }

    setLoading(true)

    getWorkout(schedule.workoutId)
      .then(setWorkout)
      .finally(() => setLoading(false))
  }, [event?.scheduleId])

  if (!event) return null

  const isCompleted = event.status === "completed"

  const totalRestSecs =
    workout?.exercises.reduce((acc, ex) => {
      const num = parseInt(
        ex.rest?.replace(/\D/g, '') || '0'
      )

      return acc + (isNaN(num) ? 0 : num)
    }, 0) ?? 0

  const formatRest = (secs: number): string => {
    if (secs === 0) return "—"

    if (secs < 60) return `${secs}s`

    const m = Math.floor(secs / 60)
    const s = secs % 60

    return s > 0
      ? `${m}m ${s}s`
      : `${m}m`
  }

  const handleDelete = async () => {
    if (!schedule || !user) return

    setDeleting(true)

    try {
      await deleteSchedule(user.uid, schedule.id)

      toast.success("Schedule deleted.")

      onDeleted?.(schedule.id)
    } catch {
      toast.error("Error deleting schedule.")
    } finally {
      setDeleting(false)
    }
  }

  const handleComplete = () => {
    if (!event) return
    onCompleted?.(event)

    toast.success(
      isCompleted
        ? "Workout marked as scheduled."
        : "Workout completed!"
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "gap-0 p-0 overflow-hidden border-none outline-none shadow-2xl rounded-[32px]",
        "w-[min(420px,calc(100vw-32px))]",
        "[&>button]:hidden"
      )}>
        <div className="relative bg-foreground/90 p-6 pt-10 text-background/80">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, var(--background) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <DialogClose className="absolute right-4 top-4 z-20 rounded-full p-2 bg-background/20 hover:bg-background/40 transition-colors">
            <X size={18} />
          </DialogClose>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-black px-3 py-1 rounded-full tracking-[0.1em] uppercase shadow-sm",
                isCompleted
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              )}>
                {isCompleted ? "Completed" : "Scheduled"}
              </span>
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight text-background/70 leading-none">
                {event.title}
              </DialogTitle>
              <p className="text-zinc-500 text-sm mt-2 font-medium italic">
                {formatDate(event.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background dark:bg-card p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Time", val: event.time, icon: Clock },
                  { label: "Rest", val: formatRest(totalRestSecs), icon: Timer },
                  { label: "Exercises", val: String(workout?.exercises.length ?? 0), icon: Dumbbell },
                ].map((item, i) => (
                  <div key={i} className="min-w-0 overflow-hidden bg-muted/40 dark:bg-secondary/20 border border-border/50 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <item.icon size={13} strokeWidth={2.5} className="shrink-0 max-[550px]:hidden" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[9px] font-black uppercase tracking-[0.08em]">{item.label}</span>
                      </div>
                    </div>
                    <span className="truncate text-base font-bold text-foreground">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <RotateCcw size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recurrence</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {schedule ? formatRecurrence(schedule) : "Once"}
                  </span>
                </div>

                {workout?.exercises && workout.exercises.length > 0 && (
                  <div className="bg-muted/30 dark:bg-muted/10 border border-border/40 rounded-2xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Exercises</span>
                    <div className="flex flex-col gap-1">
                      {workout.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground/80">{ex.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{ex.sets}×{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {schedule?.notes && (
                  <div className="bg-muted/30 dark:bg-muted/10 border border-border/40 rounded-2xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Notes</span>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">"{schedule.notes}"</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleComplete}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all active:scale-[0.97] shadow-sm",
                    isCompleted
                      ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                      : "bg-foreground text-background dark:bg-primary dark:text-primary-foreground hover:opacity-90"
                  )}
                >
                  {isCompleted ? (
                    <><RotateCcw size={18} strokeWidth={2.5} /><span className="truncate">REVERT</span></>
                  ) : (
                    <><CheckCircle2 size={18} strokeWidth={2.5} /><span className="truncate">COMPLETE WORKOUT</span></>
                  )}
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center justify-center w-14 h-[56px] border border-border rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95 shrink-0">
                      {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[32px] w-[min(380px,calc(100vw-32px))]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold">Delete schedule?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        This will permanently delete{" "}
                        <span className="font-bold text-foreground">"{event.title}"</span>
                        {schedule?.isRecurring
                          ? " and all its occurrences — past and future."
                          : "."
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                      <AlertDialogCancel className="rounded-2xl font-bold h-12 mt-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-2xl font-bold h-12"
                        variant="destructive"
                      >
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleDialog