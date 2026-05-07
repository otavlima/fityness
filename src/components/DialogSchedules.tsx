import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { type WorkoutEvent } from "@/pages/Calendar"
import { cn } from "@/lib/utils"
import ScheduleDialog from "@/components/ScheduleDialog"

type DialogSchedulesProps = {
  isOpen: boolean
  onClose: () => void
  events: WorkoutEvent[]
  date?: string
}

const DialogSchedules = ({
  isOpen,
  onClose,
  events,
  date,
}: DialogSchedulesProps) => {
  const [selectedEvent, setSelectedEvent] = useState<WorkoutEvent | null>(null)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 pb-4 overflow-hidden">
          <div className="p-5 border-b border-border bg-foreground/90">
            <DialogTitle className="text-base font-bold text-background/80">
              {date}
            </DialogTitle>

            <p className="text-xs text-muted/80 mt-1">
              {events.length} scheduled workouts
            </p>
          </div>

          <div className="flex flex-col max-h-[320px] overflow-y-auto p-4 gap-2 scrollbar-hide">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-colors text-left",
                  event.status === "completed"
                    ? "bg-primary text-primary-foreground border-transparent"
                    : event.status === "scheduled"
                    ? "border-border hover:bg-muted/40"
                    : "bg-muted text-muted-foreground border-transparent"
                )}
              >
                <span>{event.title}</span>

                <span className="text-[10px] opacity-70">
                  {event.status}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ScheduleDialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </>
  )
}

export default DialogSchedules