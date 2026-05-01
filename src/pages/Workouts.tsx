import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Plus, Dumbbell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardWorkout } from '@/components/CardWorkout'
import { getWorkouts, deleteWorkout, type WorkoutDocument } from '@/services/firebase/workout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import WorkoutModal from '@/components/modals/WorkoutModal'

const tabOptions = [
  { value: 'all', label: 'All' },
  { value: 'upper-body', label: 'Upper' },
  { value: 'lower-body', label: 'Lower' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'full-body', label: 'Full' },
]

const Workouts = () => {
  const { user } = useAuth()

  const [workouts, setWorkouts] = useState<WorkoutDocument[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDocument | null>(null)

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!user) return
    getWorkouts(user.uid)
      .then(setWorkouts)
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id)
      setWorkouts(old => old.filter(w => w.id !== id))
      toast.success('Workout deleted.')
    } catch {
      toast.error('Error deleting workout.')
    }
  }

  const handleSuccess = (workout: WorkoutDocument, isEdit: boolean) => {
    if (isEdit) {
      setWorkouts(old =>
        old.map(w => w.id === workout.id ? workout : w)
      )
    } else {
      setWorkouts(old => [workout, ...old])
    }
  }

  const getByCategory = (category: string) =>
    workouts.filter(w =>
      w.category === category &&
      w.name.toLowerCase().includes(search.toLowerCase())
    )

  const filteredAll = workouts.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeList = activeTab === 'all'
    ? filteredAll
    : getByCategory(activeTab)

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
          onClick={() => {
            setSelectedWorkout(w)
            setIsModalOpen(true)
          }}
        />
      ))}

      <button
        onClick={() => {
          setSelectedWorkout(null)
          setIsModalOpen(true)
        }}
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

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">Library</FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">Workouts</FieldTitle>
              <FieldDescription>Organize, edit, and start any routine in seconds.</FieldDescription>
            </Field>

            <Button
              onClick={() => {
                setSelectedWorkout(null)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto rounded-full gap-2 px-6"
            >
              <Plus size={18} /> New workout
            </Button>
          </div>

          {/* FILTER */}
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

          {/* LIST */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : (
            renderList(activeList)
          )}

          {/* MODAL */}
          <WorkoutModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
            editingWorkout={selectedWorkout}
          />

        </div>
      </div>
    </Header>
  )
}

export default Workouts