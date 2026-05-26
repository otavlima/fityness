import { useState, useEffect } from 'react'
import { Field, FieldTitle } from '@/components/ui/field'
import { Plus, Dumbbell, GripVertical, Trash2, ClipboardList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { workoutSchema, type Workout } from '@/schemas/workoutSchema'
import { createWorkout, updateWorkout, type WorkoutDocument } from '@/services/firebase/workout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import Loading from '@/components/Loading'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

const initialWorkout: Workout = {
  name: '',
  category: 'upper-body',
  notes: '',
  exercises: [],
}

type WorkoutErrors = {
  name?: string
  exercises?: Record<string, { name?: string; sets?: string; reps?: string; rest?: string }>
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (workout: WorkoutDocument, isEdit: boolean) => void
  editingWorkout: WorkoutDocument | null
}

const WorkoutModal = ({ isOpen, onClose, onSuccess, editingWorkout }: Props) => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const [workout, setWorkout] = useState<Workout>(initialWorkout)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<WorkoutErrors>({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500)

  const isEditing = !!editingWorkout

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 500)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
  if (!isOpen) return

  if (editingWorkout) {
    setWorkout({
      name: editingWorkout.name,
      category: editingWorkout.category,
      notes: editingWorkout.notes ?? '',
      exercises: editingWorkout.exercises,
    })
  } else {
    setWorkout(initialWorkout)
  }

  setErrors({})
}, [editingWorkout, isOpen])

  const addExercise = () => {
    setWorkout(old => ({
      ...old,
      exercises: [
        ...old.exercises,
        { id: crypto.randomUUID(), name: '', sets: '', reps: '', rest: '' }
      ]
    }))
  }

  const removeExercise = (id: string) => {
    setWorkout(old => ({
      ...old,
      exercises: old.exercises.filter(e => e.id !== id)
    }))
  }

  const updateExercise = (id: string, field: string, value: string) => {
    setWorkout(old => ({
      ...old,
      exercises: old.exercises.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }))
    setErrors(old => ({
      ...old,
      exercises: {
        ...old.exercises,
        [id]: { ...old.exercises?.[id], [field]: undefined }
      }
    }))
  }

  const handleSave = async () => {
    const result = workoutSchema.safeParse(workout)

    if (!result.success) {
      const newErrors: WorkoutErrors = {}
      const formatted = result.error.format() as z.ZodFormattedError<Workout>

      if (formatted.name?._errors?.[0]) {
        newErrors.name = formatted.name._errors[0]
      }

      if (formatted.exercises) {
        newErrors.exercises = {}
        workout.exercises.forEach((ex, idx) => {
          const exErr = (formatted.exercises as Record<number, z.ZodFormattedError<Workout['exercises'][0]>>)[idx]
          if (exErr) {
            newErrors.exercises![ex.id] = {
              name: exErr.name?._errors?.[0],
              sets: exErr.sets?._errors?.[0],
              reps: exErr.reps?._errors?.[0],
              rest: exErr.rest?._errors?.[0],
            }
          }
        })
      }

      setErrors(newErrors)
      return
    }

    if (!user) return

    setSaving(true)
    setErrors({})

    try {
      if (isEditing && editingWorkout) {
        await updateWorkout(user.uid, editingWorkout.id, result.data)

        onSuccess(
          { ...editingWorkout, ...result.data },
          true
        )

        toast.success(t('workoutModal.messages.successUpdate'))
      } else {
        const id = await createWorkout(user.uid, result.data)

        const newWorkout: WorkoutDocument = {
          ...result.data,
          id,
          uid: user.uid,
          createdAt: new Date(),
        }

        onSuccess(newWorkout, false)

        toast.success(t('workoutModal.messages.successCreate'))
      }

      onClose()
    } catch {
      toast.error(isEditing ? t('workoutModal.messages.errorUpdate') : t('workoutModal.messages.errorCreate'))
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    onClose()
    setWorkout(initialWorkout)
    setErrors({})
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={open => { if (!open) handleCloseModal() }}
      title={isEditing ? t('workoutModal.titleEdit') : t('workoutModal.titleCreate')}
      description={isEditing ? t('workoutModal.descEdit') : t('workoutModal.descCreate')}
      icon={<Dumbbell />}
      footer={
        <>
          <Button variant="ghost" onClick={handleCloseModal}>{t('workoutModal.cancel')}</Button>
          <Button className="font-bold px-6" onClick={handleSave} disabled={saving}>
            {saving
              ? <Loading text={isEditing ? t('workoutModal.saving') : t('workoutModal.creating')} isCol={false} />
              : isEditing ? t('workoutModal.saveChanges') : t('workoutModal.createWorkout')
            }
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldTitle>{t('workoutModal.nameLabel')}</FieldTitle>
            <Input
              value={workout.name}
              onChange={e => {
                setWorkout(old => ({ ...old, name: e.target.value }))
                setErrors(old => ({ ...old, name: undefined }))
              }}
              placeholder={t('workoutModal.namePlaceholder')}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </Field>

          <Field>
            <FieldTitle>{t('workoutModal.categoryLabel')}</FieldTitle>
            <Select
              value={workout.category}
              onValueChange={value =>
                setWorkout(old => ({ ...old, category: value as Workout['category'] }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upper-body">{t('workoutModal.categories.upper-body')}</SelectItem>
                <SelectItem value="lower-body">{t('workoutModal.categories.lower-body')}</SelectItem>
                <SelectItem value="push">{t('workoutModal.categories.push')}</SelectItem>
                <SelectItem value="pull">{t('workoutModal.categories.pull')}</SelectItem>
                <SelectItem value="full-body">{t('workoutModal.categories.full-body')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldTitle>{t('workoutModal.notesLabel')}</FieldTitle>
          <Textarea
            value={workout.notes}
            onChange={e => setWorkout(old => ({ ...old, notes: e.target.value }))}
            placeholder={t('workoutModal.notesPlaceholder')}
          />
        </Field>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{t('workoutModal.exercisesTitle')}</h3>
            <Button onClick={addExercise} size="sm">
              <Plus size={14} /> {t('workoutModal.btnNew')}
            </Button>
          </div>

          {workout.exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5 gap-2">
              <ClipboardList className="text-muted-foreground/20" size={32} />
              <p className="text-sm text-muted-foreground font-medium">{t('workoutModal.noExercises')}</p>
            </div>
          ) : (
            <>
            <div className="flex flex-col gap-2 max-h-[295px] overflow-y-auto scrollbar-hide pb-1">
              {workout.exercises.map((ex, idx) => {
                const exErr = errors.exercises?.[ex.id]
                return (
                  <div key={ex.id} className="flex flex-col gap-1">
                    <div className="flex flex-wrap min-[464px]:flex-nowrap items-center gap-3 p-3 bg-muted/20 border rounded-xl shrink-0">
                      <div className="flex flex-1 items-center gap-3 min-w-[0px]">
                        <GripVertical size={16} className="text-muted-foreground/30 shrink-0" />
                        <span className="text-xs font-bold text-muted-foreground/50 w-4 shrink-0">{idx + 1}</span>
                        <Input
                          placeholder={isMobile ? t('workoutModal.inputExNameMobile') : t('workoutModal.inputExName')}
                          value={ex.name}
                          onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                          className={`border-none bg-transparent shadow-none focus-visible:ring-0 p-0 font-medium flex-1 min-w-[0px] ${exErr?.name ? 'placeholder:text-destructive' : ''}`}
                        />
                      </div>
                      <div className="order-3 min-[464px]:order-2 flex items-center justify-between min-[464px]:justify-start gap-4 w-full min-[464px]:w-auto border-t min-[464px]:border-t-0 pt-2 min-[464px]:pt-0 border-border/40">
                        <div className="flex items-center gap-2">
                          <Input
                            value={ex.sets}
                            onChange={e => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '')
                              updateExercise(ex.id, 'sets', onlyNumbers)
                            }}
                            placeholder={isMobile ? t('workoutModal.inputSets') : ""}
                            className={`w-16 min-[464px]:w-12 h-8 text-center bg-muted text-sm ${exErr?.sets ? 'border-destructive' : ''}`}
                          />
                          <span className="text-muted-foreground/40 text-xs">×</span>
                          <Input
                            value={ex.reps}
                            onChange={e => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '')
                              updateExercise(ex.id, 'reps', onlyNumbers)
                            }}
                            placeholder={isMobile ? t('workoutModal.inputReps') : ""}
                            className={`w-16 min-[464px]:w-12 h-8 text-center bg-muted text-sm ${exErr?.reps ? 'border-destructive' : ''}`}
                          />
                        </div>
                        <div className="flex items-center h-8 bg-card border rounded-md px-2">
                          <input
                            value={ex.rest}
                            onChange={e => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '')
                              updateExercise(ex.id, 'rest', onlyNumbers)
                            }}
                            className="w-8 text-center bg-transparent outline-none text-sm font-medium"
                            placeholder="90"
                          />
                          <span className="text-sm font-medium text-muted-foreground">s</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="order-2 min-[464px]:order-3 h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeExercise(ex.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    {(exErr?.name || exErr?.sets || exErr?.reps || exErr?.rest) && (
                      <p className="text-destructive text-xs px-2">
                        {exErr.name || exErr.sets || exErr.reps || exErr.rest}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="hidden min-[464px]:grid grid-cols-12 px-10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="col-span-6">{t('workoutModal.tableHeaderExercise')}</span>
              <div className="col-span-6 flex justify-between text-right">
                <span>{t('workoutModal.tableHeaderSeries')}</span>
                <span>{t('workoutModal.tableHeaderReps')}</span>
                <span>{t('workoutModal.tableHeaderRest')}</span>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default WorkoutModal