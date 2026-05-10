import {
  useState,
  useEffect,
  useRef,
} from 'react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  SkipForward,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { type WorkoutDocument } from '@/services/firebase/workout'

import {
  saveWorkoutHistory,
  getLastWorkoutHistory,
} from '@/services/firebase/workoutHistory'

import { useAuth } from '@/contexts/AuthContext'

import { toast } from 'sonner'

interface SetRow {
  kg: string
  reps: string
  done: boolean
}

interface StartExercisesProps {
  open: boolean
  onOpenChange: (
    open: boolean
  ) => void
  workout: WorkoutDocument | null
  onDone?: () => void
}

const formatTime = (
  secs: number
): string => {
  const m = Math.floor(
    secs / 60
  )
    .toString()
    .padStart(2, '0')

  const s = (secs % 60)
    .toString()
    .padStart(2, '0')

  return `${m}:${s}`
}

const onlyNumbers = (
  value: string
): string =>
  value.replace(/[^0-9.]/g, '')

const StartExercises = ({
  open,
  onOpenChange,
  workout,
  onDone,
}: StartExercisesProps) => {
  const { user } = useAuth()

  const exercises =
    workout?.exercises ?? []

  const [exIdx, setExIdx] =
    useState(0)

  const [setsMap, setSetsMap] =
    useState<
      Record<string, SetRow[]>
    >({})

  const [elapsed, setElapsed] =
    useState(0)

  const [saving, setSaving] =
    useState(false)

  const [
    loadingSets,
    setLoadingSets,
  ] = useState(true)

  const timerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null)

  useEffect(() => {
    if (
      !open ||
      !workout ||
      !user
    )
      return

    const loadInitialData =
      async () => {
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
                  item.exerciseId ===
                  ex.id
              )

            const setsCount =
              Number(ex.sets) || 1

            newMap[ex.id] =
              Array.from(
                {
                  length:
                    setsCount,
                },
                (_, idx) => {
                  const previousSet =
                    previousExercise
                      ?.sets?.[idx]

                  return {
                    kg: previousSet
                      ? String(
                          previousSet.kg
                        )
                      : '',

                    reps:
                      previousSet
                        ? String(
                            previousSet.reps
                          )
                        : String(
                            ex.reps ||
                              ''
                          ),

                    done: false,
                  }
                }
              )
          }

          setSetsMap(newMap)
        } catch (error) {
          console.error(error)

          toast.error(
            'Error loading workout data.'
          )
        } finally {
          setLoadingSets(false)
        }
      }

    loadInitialData()
  }, [
    open,
    workout,
    user,
    exercises,
  ])

  useEffect(() => {
    if (!open) {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        )
      }

      return
    }

    timerRef.current =
      setInterval(() => {
        setElapsed(
          (prev) => prev + 1
        )
      }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        )
      }
    }
  }, [open])

  if (!open || !workout)
    return null

  const ex = exercises[exIdx]

  if (!ex) {
    return (
      <Dialog
        open={open}
        onOpenChange={
          onOpenChange
        }
      >
        <DialogContent>
          <DialogTitle>
            Workout
          </DialogTitle>

          <p>
            No exercises found.
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  const sets =
    setsMap[ex.id] ?? []

  const isLast =
    exIdx ===
    exercises.length - 1

  const isFirst = exIdx === 0

  const completedSets =
    sets.filter((s) => s.done)
      .length

  const updateSet = (
    setIdx: number,
    field: 'kg' | 'reps',
    value: string
  ) => {
    const clean =
      onlyNumbers(value)

    setSetsMap((old) => ({
      ...old,

      [ex.id]: (
        old[ex.id] ?? []
      ).map((set, idx) =>
        idx === setIdx
          ? {
              ...set,
              [field]: clean,
            }
          : set
      ),
    }))
  }

  const toggleDone = (
    setIdx: number
  ) => {
    const currentSet =
      sets[setIdx]

    if (
      !currentSet?.kg ||
      isNaN(
        Number(currentSet.kg)
      )
    ) {
      toast.error(
        'Enter the weight before marking as done.'
      )

      return
    }

    setSetsMap((old) => ({
      ...old,

      [ex.id]: (
        old[ex.id] ?? []
      ).map((set, idx) =>
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

    setExIdx(
      (prev) => prev - 1
    )
  }

  const handleSkip = () => {
    if (!isLast) {
      setExIdx(
        (prev) => prev + 1
      )
    }
  }

  const handleNext = () => {
    if (!isLast) {
      setExIdx(
        (prev) => prev + 1
      )

      return
    }

    handleFinish()
  }

  const handleFinish =
    async () => {
      if (!user || !workout)
        return

      try {
        setSaving(true)

        const exerciseResults =
          exercises.map(
            (exercise) => ({
              exerciseId:
                exercise.id,

              exerciseName:
                exercise.name,

              sets: (
                setsMap[
                  exercise.id
                ] ?? []
              ).map(
                (
                  set,
                  idx
                ) => ({
                  setIndex: idx,
                  kg:
                    Number(
                      set.kg
                    ) || 0,
                  reps:
                    Number(
                      set.reps
                    ) || 0,
                  done:
                    set.done,
                })
              ),
            })
          )

        await saveWorkoutHistory(
          user.uid,
          {
            uid: user.uid,
            workoutId:
              workout.id!,
            workoutName:
              workout.name,
            exercises:
              exerciseResults,
            duration:
              elapsed,
          }
        )

        toast.success(
          'Workout saved!'
        )

        onDone?.()

        onOpenChange(false)
      } catch (error) {
        console.error(error)

        toast.error(
          'Error saving workout.'
        )
      } finally {
        setSaving(false)
      }
    }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent
        aria-describedby={
          undefined
        }
        className={cn(
          'gap-0 overflow-hidden border-none p-0 shadow-2xl',
          'w-[calc(100vw-16px)] sm:w-[min(460px,calc(100vw-24px))]',
          'max-h-[95vh]',
          'rounded-[26px] sm:rounded-[28px]',
          '[&>button]:hidden'
        )}
      >
        <VisuallyHidden>
          <DialogTitle>
            Start Workout
          </DialogTitle>
        </VisuallyHidden>

        <div className="flex max-h-[95vh] flex-col overflow-hidden">

          {/* HEADER */}
          <div className="relative bg-foreground px-4 pb-5 pt-5 sm:px-6 sm:pt-6">

            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, var(--background) 1px, transparent 1px)',

                backgroundSize:
                  '14px 14px',
              }}
            />

            <button
              type="button"
              onClick={() =>
                onOpenChange(false)
              }
              className="absolute right-3 top-3 z-50 rounded-full bg-background/15 p-2 transition-colors hover:bg-background/30 sm:right-4 sm:top-4"
            >
              <X
                size={16}
                className="text-background/70"
              />
            </button>

            <div className="relative z-10">

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <div className="flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1">
                  <Play
                    size={10}
                    className="fill-background/60 text-background/60"
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-background/60">
                    {formatTime(
                      elapsed
                    )}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-background/40">
                  {exIdx + 1} /{' '}
                  {
                    exercises.length
                  }
                </span>
              </div>

              <h2 className="max-w-[90%] text-[26px] font-black leading-tight tracking-tight text-background/80 sm:text-3xl">
                {ex.name}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">

                <span className="text-xs font-semibold text-background/40">
                  {workout.name}
                </span>

                {workout.category && (
                  <>
                    <span className="text-background/20">
                      ·
                    </span>

                    <span className="text-xs font-semibold capitalize text-background/40">
                      {workout.category.replace(
                        '-',
                        ' '
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-4 h-1 overflow-hidden rounded-full bg-background/10">
              <div
                className="h-full rounded-full bg-background/50 transition-all duration-500"
                style={{
                    width: `${
                        (exIdx /
                        exercises.length) *
                        100
                    }%`,
                }}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-hidden bg-background px-4 pb-2 pt-5 dark:bg-card sm:px-6">

            <div className="grid grid-cols-[30px_1fr_72px_58px_36px] gap-2 px-2 sm:grid-cols-[36px_1fr_90px_72px_40px] sm:px-3">

              {[
                'SET',
                'PREV',
                'KG',
                'REPS',
                '',
              ].map(
                (
                  header,
                  idx
                ) => (
                  <span
                    key={idx}
                    className="mb-3 text-center text-[8px] font-black uppercase tracking-widest text-muted-foreground sm:text-[9px]"
                  >
                    {header}
                  </span>
                )
              )}
            </div>

            <div className="scrollbar-hide flex max-h-[320px] flex-col gap-2 overflow-y-auto pb-1">

              {loadingSets ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Loading sets...
                </p>
              ) : sets.length ===
                0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No sets configured.
                </p>
              ) : (
                sets.map(
                  (set, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'grid grid-cols-[30px_1fr_72px_58px_36px] items-center gap-2 rounded-2xl px-2 py-2.5 transition-all sm:grid-cols-[36px_1fr_90px_72px_40px] sm:px-3',

                        set.done
                          ? 'bg-primary/10 dark:bg-primary/20'
                          : 'bg-muted/30 dark:bg-muted/10'
                      )}
                    >

                      <span
                        className={cn(
                          'text-center text-sm font-black',

                          set.done
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      >
                        {idx + 1}
                      </span>

                      <span className="truncate text-center text-[10px] font-semibold text-muted-foreground/60 sm:text-xs">
                        {set.kg
                          ? `${set.kg}kg × ${set.reps}`
                          : `— × ${ex.reps}`}
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="kg"
                        value={
                          set.kg
                        }
                        onChange={(
                          e
                        ) =>
                          updateSet(
                            idx,
                            'kg',
                            e.target
                              .value
                          )
                        }
                        className={cn(
                          'h-9 w-full rounded-xl border bg-background text-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm dark:bg-card',

                          set.done
                            ? 'border-primary/30 text-primary'
                            : 'border-border text-foreground'
                        )}
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          set.reps
                        }
                        onChange={(
                          e
                        ) =>
                          updateSet(
                            idx,
                            'reps',
                            e.target
                              .value
                          )
                        }
                        className={cn(
                          'h-9 w-full rounded-xl border bg-background text-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm dark:bg-card',

                          set.done
                            ? 'border-primary/30 text-primary'
                            : 'border-border text-foreground'
                        )}
                      />

                      <button
                        onClick={() =>
                          toggleDone(
                            idx
                          )
                        }
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95',

                          set.done
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        <Check
                          size={14}
                          strokeWidth={
                            3
                          }
                        />
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-b border-border/50 pb-4">

              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {
                  completedSets
                }
                /{sets.length}{' '}
                completed
              </span>

              {!isLast && (
                <button
                  onClick={
                    handleSkip
                  }
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  <SkipForward
                    size={11}
                  />

                  Skip
                </button>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex gap-3 bg-background px-4 pb-4 pt-4 dark:bg-card sm:px-6 sm:pb-6">

            <button
              onClick={
                handleBack
              }
              className="flex w-1/2 items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-bold text-muted-foreground transition-all active:scale-95 hover:bg-muted/40"
            >
              <ChevronLeft
                size={16}
              />

              {isFirst
                ? 'Close'
                : 'Back'}
            </button>

            <button
              onClick={
                handleNext
              }
              disabled={
                saving ||
                loadingSets
              }
              className="flex w-1/2 items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-black text-background shadow-sm transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-60 dark:bg-primary dark:text-primary-foreground"
            >

              {saving ? (
                <span className="animate-pulse">
                  Saving...
                </span>
              ) : isLast ? (
                <>
                  <Check
                    size={16}
                    strokeWidth={
                      3
                    }
                  />

                  Done
                </>
              ) : (
                <>
                  <span className="truncate">
                    Next
                  </span>

                  <ChevronRight
                    size={16}
                    strokeWidth={
                      3
                    }
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StartExercises