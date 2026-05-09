import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  SkipForward,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { type WorkoutDocument } from "@/services/firebase/workout"

import {
  saveWorkoutHistory,
  getLastWorkoutHistory,
} from "@/services/firebase/workoutHistory"

import { useAuth } from "@/contexts/AuthContext"

import { toast } from "sonner"

interface SetRow {
  kg: string
  reps: string
  done: boolean
}

interface StartExercisesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout: WorkoutDocument | null
  onDone?: () => void
}

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0")

  const s = (secs % 60)
    .toString()
    .padStart(2, "0")

  return `${m}:${s}`
}

const onlyNumbers = (value: string): string =>
  value.replace(/[^0-9.]/g, "")

const StartExercises = ({
  open,
  onOpenChange,
  workout,
  onDone,
}: StartExercisesProps) => {
  const { user } = useAuth()

  const exercises = workout?.exercises ?? []

  const [exIdx, setExIdx] = useState(0)

  const [setsMap, setSetsMap] = useState<
    Record<string, SetRow[]>
  >({})

  const [elapsed, setElapsed] = useState(0)

  const [saving, setSaving] = useState(false)

  const [loadingSets, setLoadingSets] =
    useState(true)

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    )

  useEffect(() => {
    if (!open || !workout || !user) return

    const loadInitialData = async () => {
      try {
        setLoadingSets(true)

        setExIdx(0)
        setElapsed(0)

        const history =
          await getLastWorkoutHistory(
            user.uid,
            workout.id!
          )

        const newMap: Record<
          string,
          SetRow[]
        > = {}

        for (const ex of exercises) {
          const previousExercise =
            history?.exercises?.find(
              (item) =>
                item.exerciseId === ex.id
            )

          const setsCount =
            Number(ex.sets) || 1

          newMap[ex.id] = Array.from(
            { length: setsCount },
            (_, idx) => {
              const previousSet =
                previousExercise?.sets?.[idx]

              return {
                kg: previousSet
                  ? String(previousSet.kg)
                  : "",

                reps: previousSet
                  ? String(previousSet.reps)
                  : String(ex.reps || ""),

                done:
                  previousSet?.done || false,
              }
            }
          )
        }

        setSetsMap(newMap)
      } catch (error) {
        console.error(error)

        toast.error(
          "Error loading workout data."
        )
      } finally {
        setLoadingSets(false)
      }
    }

    loadInitialData()
  }, [open, workout, user])

  useEffect(() => {
    if (!open) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      return
    }

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [open])

  if (!open || !workout) return null

  const ex = exercises[exIdx]

  if (!ex) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogTitle>
            Workout
          </DialogTitle>

          <p>No exercises found.</p>
        </DialogContent>
      </Dialog>
    )
  }

  const sets = setsMap[ex.id] ?? []

  const isLast =
    exIdx === exercises.length - 1

  const isFirst = exIdx === 0

  const completedSets = sets.filter(
    (s) => s.done
  ).length

  const updateSet = (
    setIdx: number,
    field: "kg" | "reps",
    value: string
  ) => {
    const clean = onlyNumbers(value)

    setSetsMap((old) => ({
      ...old,

      [ex.id]: (old[ex.id] ?? []).map(
        (set, idx) =>
          idx === setIdx
            ? {
                ...set,
                [field]: clean,
              }
            : set
      ),
    }))
  }

  const toggleDone = (setIdx: number) => {
    const currentSet = sets[setIdx]

    if (
      !currentSet?.kg ||
      isNaN(Number(currentSet.kg))
    ) {
      toast.error(
        "Enter the weight before marking as done."
      )

      return
    }

    setSetsMap((old) => ({
      ...old,

      [ex.id]: (old[ex.id] ?? []).map(
        (set, idx) =>
          idx === setIdx
            ? {
                ...set,
                done: !set.done,
              }
            : set
      ),
    }))
  }

  const handleBack = () => {
    if (isFirst) {
      onOpenChange(false)
      return
    }

    setExIdx((prev) => prev - 1)
  }

  const handleSkip = () => {
    if (!isLast) {
      setExIdx((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (!isLast) {
      setExIdx((prev) => prev + 1)
      return
    }

    handleFinish()
  }

  const handleFinish = async () => {
    if (!user || !workout) return

    try {
      setSaving(true)

      const exerciseResults =
        exercises.map((exercise) => ({
          exerciseId: exercise.id,

          exerciseName: exercise.name,

          sets: (
            setsMap[exercise.id] ?? []
          ).map((set, idx) => ({
            setIndex: idx,
            kg: Number(set.kg) || 0,
            reps:
              Number(set.reps) || 0,
            done: set.done,
          })),
        }))

      await saveWorkoutHistory(
        user.uid,
        {
          uid: user.uid,
          workoutId: workout.id!,
          workoutName: workout.name,
          exercises: exerciseResults,
          duration: elapsed,
        }
      )

      toast.success("Workout saved!")

      onDone?.()

      onOpenChange(false)
    } catch (error) {
      console.error(error)

      toast.error(
        "Error saving workout."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "gap-0 p-0 overflow-hidden border-none shadow-2xl",
          "w-[min(460px,calc(100vw-24px))] rounded-[28px] [&>button]:hidden"
        )}
      >
        <VisuallyHidden>
          <DialogTitle>
            Start Workout
          </DialogTitle>
        </VisuallyHidden>

        {/* HEADER */}
        <div className="relative bg-foreground px-6 pt-6 pb-5">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--background) 1px, transparent 1px)",

              backgroundSize:
                "14px 14px",
            }}
          />

          <button
            type="button"
            onClick={() =>
              onOpenChange(false)
            }
            className="absolute right-4 top-4 z-50 rounded-full p-1.5 bg-background/15 hover:bg-background/30 transition-colors"
          >
            <X
              size={16}
              className="text-background/70"
            />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 bg-background/10 rounded-full px-3 py-1">
                <Play
                  size={10}
                  className="text-background/60 fill-background/60"
                />

                <span className="text-[10px] font-black text-background/60 tracking-widest uppercase">
                  {formatTime(elapsed)}
                </span>
              </div>

              <span className="text-[10px] font-bold text-background/40 uppercase tracking-widest">
                {exIdx + 1} /{" "}
                {exercises.length}
              </span>
            </div>

            <h2 className="text-2xl font-black text-background/80 leading-tight tracking-tight">
              {ex.name}
            </h2>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-background/40 text-xs font-semibold">
                {workout.name}
              </span>

              {workout.category && (
                <>
                  <span className="text-background/20">
                    ·
                  </span>

                  <span className="text-background/40 text-xs font-semibold capitalize">
                    {workout.category.replace(
                      "-",
                      " "
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-4 h-1 bg-background/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-background/50 rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((exIdx + 1) /
                    exercises.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-background dark:bg-card px-6 pt-5 pb-2">
          <div className="grid grid-cols-[36px_1fr_90px_72px_40px] gap-2 mb-3 px-3">
            {[
              "SET",
              "PREV",
              "KG",
              "REPS",
              "",
            ].map((header, idx) => (
              <span
                key={idx}
                className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center"
              >
                {header}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto scrollbar-hide pb-1">
            {loadingSets ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Loading sets...
              </p>
            ) : sets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No sets configured.
              </p>
            ) : (
              sets.map((set, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "grid grid-cols-[36px_1fr_90px_72px_40px] gap-2 items-center py-2.5 px-3 rounded-2xl transition-all",

                    set.done
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "bg-muted/30 dark:bg-muted/10"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-black text-center",

                      set.done
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </span>

                  <span className="text-xs font-semibold text-muted-foreground/60 text-center truncate">
                    {set.kg
                      ? `${set.kg}kg × ${set.reps}`
                      : `— × ${ex.reps}`}
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="kg"
                    value={set.kg}
                    onChange={(e) =>
                      updateSet(
                        idx,
                        "kg",
                        e.target.value
                      )
                    }
                    className={cn(
                      "w-full h-9 rounded-xl text-center text-sm font-bold bg-background dark:bg-card border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all",

                      set.done
                        ? "border-primary/30 text-primary"
                        : "border-border text-foreground"
                    )}
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        idx,
                        "reps",
                        e.target.value
                      )
                    }
                    className={cn(
                      "w-full h-9 rounded-xl text-center text-sm font-bold bg-background dark:bg-card border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all",

                      set.done
                        ? "border-primary/30 text-primary"
                        : "border-border text-foreground"
                    )}
                  />

                  <button
                    onClick={() =>
                      toggleDone(idx)
                    }
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95",

                      set.done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Check
                      size={14}
                      strokeWidth={3}
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pb-4 border-b border-border/50">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {completedSets}/
              {sets.length} sets completed
            </span>

            {!isLast && (
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-[10px] font-black text-muted-foreground/50 hover:text-muted-foreground uppercase tracking-widest transition-colors"
              >
                <SkipForward size={11} />

                Skip
              </button>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-background dark:bg-card px-6 pb-6 pt-4 flex gap-3">
          <button
            onClick={handleBack}
            className="w-1/2 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-muted-foreground border border-border hover:bg-muted/40 transition-all active:scale-95"
          >
            <ChevronLeft size={16} />

            {isFirst ? "Close" : "Back"}
          </button>

          <button
            onClick={handleNext}
            disabled={
              saving || loadingSets
            }
            className="w-1/2 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black bg-foreground text-background dark:bg-primary dark:text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <span className="animate-pulse">
                Saving...
              </span>
            ) : isLast ? (
              <>
                <Check
                  size={16}
                  strokeWidth={3}
                />
                Done
              </>
            ) : (
              <>
                Next Exercise

                <ChevronRight
                  size={16}
                  strokeWidth={3}
                />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StartExercises