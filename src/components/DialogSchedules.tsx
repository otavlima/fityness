import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type WorkoutStatus } from "@/pages/Calendar"
import { cn } from "@/lib/utils"

export interface WorkoutEvent {
  id: string
  date: string 
  title: string
  status: WorkoutStatus
}

type DialogSchedulesProps = {
  isOpen: boolean
  onClose: () => void
  events: WorkoutEvent[]
  date?: string
}

const DialogSchedules = ({ isOpen, onClose, events, date }: DialogSchedulesProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 pb-4 overflow-hidden">
        <div className="p-5 border-b border-border">
          <DialogTitle className="text-base font-bold">
            {date}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {events.length} scheduled workouts
          </p>
        </div>

        <div className="flex flex-col max-h-[320px] overflow-y-auto p-4 gap-2 scrollbar-hide">
          {events.map(event => (
            <div
              key={event.id}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold uppercase",
                event.status === 'completed'
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : event.status === 'scheduled'
                  ? 'border-border'
                  : 'bg-muted text-muted-foreground border-transparent'
              )}
            >
              <span>{event.title}</span>
              <span className="text-[10px] opacity-70">{event.status}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogSchedules