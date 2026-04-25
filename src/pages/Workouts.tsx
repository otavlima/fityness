import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Plus, Dumbbell, GripVertical, Trash2, ClipboardList, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { workoutSchema, type Workout } from '@/schemas/workoutSchema'
import { CardWorkout } from '@/components/CardWorkout'
import { createWorkout, getWorkouts, deleteWorkout, updateWorkout, type WorkoutDocument } from '@/services/firebase/workout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Loading from '@/components/Loading'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { z } from 'zod'

const initialWorkout: Workout = {
  name:      '',
  category:  'upper-body',
  notes:     '',
  exercises: [],
}

type WorkoutErrors = {
  name?: string
  exercises?: Record<string, { name?: string; sets?: string; reps?: string; rest?: string }>
}

const tabOptions = [
  { value: 'all',        label: 'All' },
  { value: 'upper-body', label: 'Upper' },
  { value: 'lower-body', label: 'Lower' },
  { value: 'push',       label: 'Push' },
  { value: 'pull',       label: 'Pull' },
  { value: 'full-body',  label: 'Full' },
]

const Workouts = () => {
  const { user }                            = useAuth()
  const [isModalOpen, setIsModalOpen]       = useState(false)
  const [workout, setWorkout]               = useState<Workout>(initialWorkout)
  const [workouts, setWorkouts]             = useState<WorkoutDocument[]>([])
  const [editingId, setEditingId]           = useState<string | null>(null)
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [search, setSearch]                 = useState('')
  const [activeTab, setActiveTab]           = useState('all')
  const [errors, setErrors]                 = useState<WorkoutErrors>({})
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 500)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 500)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user) return
    getWorkouts(user.uid)
      .then(setWorkouts)
      .finally(() => setLoading(false))
  }, [user])

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

  const handleCreate = async () => {
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
    setErrors({})
    setSaving(true)

    try {
      if (editingId) {
        await updateWorkout(editingId, result.data)
        setWorkouts(old => old.map(w => w.id === editingId ? { ...w, ...result.data } : w))
        toast.success('Workout updated!')
      } else {
        const id = await createWorkout(user.uid, result.data)
        const newWorkout: WorkoutDocument = {
          ...result.data,
          id,
          uid: user.uid,
          createdAt: new Date(),
        }
        setWorkouts(old => [newWorkout, ...old])
        toast.success('Workout created!')
      }
      setWorkout(initialWorkout)
      setEditingId(null)
      setIsModalOpen(false)
    } catch {
      toast.error(editingId ? 'Error updating workout.' : 'Error creating workout.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (w: WorkoutDocument) => {
    setWorkout({
      name:      w.name,
      category:  w.category,
      notes:     w.notes ?? '',
      exercises: w.exercises,
    })
    setEditingId(w.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id)
      setWorkouts(old => old.filter(w => w.id !== id))
      toast.success('Workout deleted.')
    } catch {
      toast.error('Error deleting workout.')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setWorkout(initialWorkout)
    setEditingId(null)
    setErrors({})
  }

  const getByCategory = (category: Workout['category']) =>
    workouts.filter(w => w.category === category && w.name.toLowerCase().includes(search.toLowerCase()))

  const filteredAll = workouts.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeList = activeTab === 'all'
    ? filteredAll
    : getByCategory(activeTab as Workout['category'])

  const renderList = (list: WorkoutDocument[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      {list.map(w => (
        <CardWorkout
          key={w.id}
          name={w.name}
          category={w.category}
          exerciseCount={w.exercises.length}
          duration="45m"
          lastDone={w.lastDone ?? 'Never'}
          onDelete={() => handleDelete(w.id!)}
          onClick={() => handleEdit(w)}
        />
      ))}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/30 rounded-2xl bg-transparent hover:bg-muted/30 transition-colors min-h-[250px] text-center"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-muted/50 mb-4">
          <Dumbbell size={24} className="text-muted-foreground" />
        </div>
        <h3 className="font-bold text-lg mb-1 text-foreground">Create new workout</h3>
        <p className="text-sm text-muted-foreground">Build from scratch or use a template</p>
      </button>
    </div>
  )

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">Library</FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">Workouts</FieldTitle>
              <FieldDescription>Organize, edit, and start any routine in seconds.</FieldDescription>
            </Field>
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto gap-2">
              <Plus size={18} /> New workout
            </Button>
          </div>

          <Modal
            open={isModalOpen}
            onOpenChange={open => { if (!open) handleCloseModal(); else setIsModalOpen(true) }}
            title={editingId ? 'Edit workout' : 'Create new workout'}
            description={editingId ? 'Update your workout details.' : 'Set up your session and organize your exercises.'}
            icon={<Dumbbell />}
            footer={
              <>
                <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <Button className="font-bold px-6" onClick={handleCreate} disabled={saving}>
                  {saving
                    ? <Loading text={editingId ? 'Saving' : 'Creating'} isCol={false} />
                    : editingId ? 'Save changes' : 'Create workout'
                  }
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldTitle>Workout name</FieldTitle>
                  <Input
                    value={workout.name}
                    onChange={e => {
                      setWorkout(old => ({ ...old, name: e.target.value }))
                      setErrors(old => ({ ...old, name: undefined }))
                    }}
                    placeholder='Ex: Chest & Triceps'
                    className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </Field>
                <Field>
                  <FieldTitle>Category</FieldTitle>
                  <Select
                    value={workout.category}
                    onValueChange={value => setWorkout(old => ({ ...old, category: value as Workout['category'] }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upper-body">Upper body</SelectItem>
                      <SelectItem value="lower-body">Lower body</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="pull">Pull</SelectItem>
                      <SelectItem value="full-body">Full body</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldTitle>Notes</FieldTitle>
                <Textarea
                  value={workout.notes}
                  onChange={e => setWorkout(old => ({ ...old, notes: e.target.value }))}
                  placeholder="Focus on technique, rest 90 seconds between heavy sets."
                />
              </Field>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Exercises</h3>
                  <Button onClick={addExercise} size="sm"><Plus size={14} /> New</Button>
                </div>

                {workout.exercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5 gap-2">
                    <ClipboardList className="text-muted-foreground/20" size={32} />
                    <p className="text-sm text-muted-foreground font-medium">No exercises added yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 max-h-[295px] overflow-y-auto scrollbar-hide pb-1">
                      {workout.exercises.map((ex, idx) => {
                        const exErr = errors.exercises?.[ex.id]
                        return (
                          <div key={ex.id} className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 p-3 bg-muted/20 border rounded-xl shrink-0">
                              <GripVertical size={16} className="text-muted-foreground/30" />
                              <span className="text-xs font-bold text-muted-foreground/50 w-4">{idx + 1}</span>
                              <Input
                                placeholder={isMobile ? 'Name' : 'Exercise name'}
                                value={ex.name}
                                onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                                className={`border-none bg-transparent shadow-none focus-visible:ring-0 p-0 font-medium ${exErr?.name ? 'placeholder:text-destructive' : ''}`}
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  value={ex.sets}
                                  onChange={e => updateExercise(ex.id, 'sets', e.target.value)}
                                  className={`w-12 h-8 text-center bg-muted ${exErr?.sets ? 'border-destructive' : ''}`}
                                />
                                <span className="text-muted-foreground/40 text-xs">×</span>
                                <Input
                                  value={ex.reps}
                                  onChange={e => updateExercise(ex.id, 'reps', e.target.value)}
                                  className={`w-12 h-8 text-center bg-muted ${exErr?.reps ? 'border-destructive' : ''}`}
                                />
                                <Input
                                  value={ex.rest}
                                  onChange={e => updateExercise(ex.id, 'rest', e.target.value)}
                                  className={`w-16 h-8 text-center bg-card border rounded-md text-[10px] font-bold text-muted-foreground ${exErr?.rest ? 'border-destructive' : ''}`}
                                  placeholder="90s"
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeExercise(ex.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </div>
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
                    <div className="grid grid-cols-12 px-10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="col-span-6">Exercise</span>
                      <div className="col-span-6 flex justify-between text-right">
                        <span>Series</span>
                        <span>Reps</span>
                        <span>Rest</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Modal>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="hidden sm:block">
                  <Tabs>
                    <TabsList>
                      {tabOptions.map(t => (
                        <TabsTrigger
                          key={t.value}
                          value={t.value}
                          onClick={() => setActiveTab(t.value)}
                          data-state={activeTab === t.value ? 'active' : 'inactive'}
                        >
                          {t.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <div className="block sm:hidden w-full max-w-32">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tabOptions.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex items-center w-full sm:w-auto max-[640px]:mt-2">
                  <Search size={16} className="absolute left-3 text-muted-foreground" />
                  <Input
                    placeholder="Search for workouts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64 bg-muted/20 border-none"
                  />
                </div>
              </div>
              {renderList(activeList)}
            </div>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Workouts