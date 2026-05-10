import {
  ChevronRight,
  Clock3,
  Trophy,
  Dumbbell,
  CalendarDays,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { WorkoutGroup } from '@/pages/History'

type Props = {
  workout: WorkoutGroup
  onClick: () => void
}

const formatVolume = (volume: number) => {
  if (volume >= 1000) {
    return `${((volume / 1000)).toFixed(1)}t`
  }

  return `${volume}kg`
}

const formatDuration = (seconds: number) => {
  return `${Math.max(
    1,
    Math.floor(seconds / 60)
  )}m`
}

const HistoryWorkoutCard = ({ workout, onClick, }: Props) => {
  return (
    <Card
      onClick={onClick}
      className="group overflow-hidden rounded-3xl border-border/50 bg-card cursor-pointer transition-all duration-200 hover:scale-[1.025] hover:border-border hover:shadow-xl"
    >
      <div className="px-4 pt-0 pb-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-1">
              {workout.category || 'Workout'}
            </div>
            <h2 className="text-xl font-bold tracking-tight leading-none truncate">
              {workout.workoutName}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {workout.totalSessions} sessions registered
            </p>
          </div>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary/60 border border-border/50 shrink-0 mt-1">
            <ChevronRight
              size={14}
              className="text-muted-foreground"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border/50 bg-secondary/20 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays
                size={10}
                className="text-muted-foreground"
              />
              <span className="text-[8px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
                Sessions
              </span>
            </div>
            <p className="text-lg font-bold leading-none">
              {workout.totalSessions}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-secondary/20 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-1">
              <Dumbbell
                size={10}
                className="text-muted-foreground"
              />
              <span className="text-[8px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
                Volume
              </span>
            </div>
            <p className="text-lg font-bold leading-none truncate">
              {formatVolume(
                workout.bestVolume
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-secondary/20 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-1">
              <Clock3
                size={10}
                className="text-muted-foreground"
              />
              <span className="text-[8px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
                Last
              </span>
            </div>
            <p className="text-lg font-bold leading-none">
              {formatDuration(
                workout.lastDuration
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/10 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
              Current PR
            </p>
            <p className="text-xs font-semibold truncate">
              {workout.currentPRExercise ||
                'No PR yet'}
            </p>
          </div>
          <Trophy
            size={13}
            className="text-muted-foreground shrink-0"
          />
        </div>
      </div>
    </Card>
  )
}

export default HistoryWorkoutCard