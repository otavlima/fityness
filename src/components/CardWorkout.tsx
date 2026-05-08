import {
  Clock3,
  Dumbbell,
  MoreVertical,
  Trash2,
  CalendarDays,
  Pencil
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

interface CardWorkoutProps {
  name: string

  category:
    | 'upper-body'
    | 'lower-body'
    | 'push'
    | 'pull'
    | 'full-body'

  exerciseCount: number

  duration: string

  lastDone: string

  onDelete?: () => void

  onClick?: () => void

  onSchedule?: () => void
}

const categoryMap: Record<
  CardWorkoutProps['category'],
  string
> = {
  'upper-body': 'Upper Body',
  'lower-body': 'Lower Body',
  push: 'Push',
  pull: 'Pull',
  'full-body': 'Full Body',
}

export const CardWorkout = ({
  name,
  category,
  exerciseCount,
  duration,
  lastDone,
  onDelete,
  onClick,
  onSchedule,
}: CardWorkoutProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg cursor-pointer"
    >
      <div className="absolute right-4 top-4 flex items-center gap-2">

        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onSchedule?.()
          }}
        >
          <CalendarDays size={18} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onSchedule?.()
              }}
            >
              <CalendarDays size={16} className="mr-2" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Dumbbell
            size={22}
            className="text-primary"
          />
        </div>

        <div>
          <h3 className="text-xl font-bold tracking-tight">
            {name}
          </h3>

          <p className="text-sm text-muted-foreground font-medium">
            {categoryMap[category]}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Dumbbell size={15} />

          <span>
            {exerciseCount} exercises
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock3 size={15} />

          <span>{duration}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Last done: {lastDone}
        </span>

        <span className="text-sm font-semibold text-primary">
          Start
        </span>
      </div>
    </div>
  )
}