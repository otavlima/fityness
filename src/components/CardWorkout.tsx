import { Dumbbell, Layers, Clock, CalendarDays, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface CardWorkoutProps {
  name: string
  category: string
  exerciseCount: number
  duration?: string
  lastDone?: string
  onDelete?: () => void
  onClick?: () => void
}

export function CardWorkout({
  name,
  category,
  exerciseCount,
  duration = "45m",
  lastDone = "Today",
  onDelete,
  onClick,
}: CardWorkoutProps) {
  const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
      'upper-body': 'UPPER',
      'lower-body': 'LEGS',
      'push': 'PUSH',
      'pull': 'PULL',
      'full-body': 'FULL'
    }
    return map[cat] || cat.toUpperCase()
  }

  return (
    <div
      className="flex flex-col p-5 border rounded-2xl bg-card hover:shadow-sm transition-all text-left cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50">
          <Dumbbell size={20} className="text-foreground" />
        </div>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={e => e.stopPropagation()}
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={e => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workout?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-semibold text-foreground">"{name}"</span> will be permanently deleted and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={e => { e.stopPropagation(); onDelete() }}
                  variant="destructive"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="mb-2">
        <span className="border border-muted-foreground/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-muted-foreground bg-transparent">
          {formatCategory(category)}
        </span>
      </div>
      <h3 className="font-bold text-xl mb-4">{name}</h3>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1.5">
          <Layers size={14} />
          <span>{exerciseCount} exerc.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{duration}</span>
        </div>
      </div>
      <div className="w-full h-px bg-border mb-4 mt-auto" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Last: {lastDone}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-muted-foreground/20"
            onClick={e => e.stopPropagation()}
          >
            <CalendarDays size={16} className="text-muted-foreground" />
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full px-5 gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-semibold"
            onClick={e => e.stopPropagation()}
          >
            <Play size={14} fill="currentColor" /> Start
          </Button>
        </div>
      </div>
    </div>
  )
}