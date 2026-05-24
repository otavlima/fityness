import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "../firebase"
import { type Workout } from "@/schemas/workoutSchema"
import { updateWorkoutNameInHistory } from "./workoutHistory"
import { updateScheduleWorkoutName } from "./schedule"

const COLLECTION = "workouts"

export interface WorkoutDocument extends Workout {
  id: string
  uid: string
  createdAt: Date
  lastDone?: string
}

export const createWorkout = async (
  uid: string,
  data: Workout
): Promise<string> => {
  const ref = await addDoc(
    collection(db, COLLECTION),
    {
      ...data,
      uid,
      createdAt: Timestamp.now(),
    }
  )

  return ref.id
}

export const getWorkouts = async (
  uid: string
): Promise<WorkoutDocument[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid)
  )

  const snap = await getDocs(q)

  return snap.docs.map(doc => ({
    ...(doc.data() as Omit<
      WorkoutDocument,
      'id' | 'createdAt'
    >),

    id: doc.id,

    createdAt:
      doc.data().createdAt?.toDate(),
  }))
}

export const updateWorkout = async (uid: string, id: string, data: Partial<Workout>) => {
  await updateDoc(doc(db, COLLECTION, id), { ...data })

  if (data.name) {
    await Promise.all([
      updateWorkoutNameInHistory(uid, id, data.name),
      updateScheduleWorkoutName(uid, id, data.name),
    ])
  }
}

export const deleteWorkout = async (uid: string, id: string) => {
  const batch = writeBatch(db)

  batch.delete(doc(db, COLLECTION, id))

  const schedulesSnap = await getDocs(
    query(collection(db, "schedules"), where("uid", "==", uid), where("workoutId", "==", id))
  )
  const scheduleIds = schedulesSnap.docs.map(d => d.id)
  schedulesSnap.docs.forEach(d => batch.delete(d.ref))

  if (scheduleIds.length > 0) {
    const statusSnap = await getDocs(
      query(collection(db, "schedule_status"), where("uid", "==", uid), where("scheduleId", "in", scheduleIds))
    )
    statusSnap.docs.forEach(d => batch.delete(d.ref))
  }

  const historySnap = await getDocs(
    query(collection(db, "workout_history"), where("uid", "==", uid), where("workoutId", "==", id))
  )
  historySnap.docs.forEach(d => batch.delete(d.ref))

  await batch.commit()
}

export const getWorkout = async (
  id: string
): Promise<WorkoutDocument | null> => {
  const snap = await getDoc(
    doc(db, COLLECTION, id)
  )

  if (!snap.exists()) return null

  return {
    ...(snap.data() as Omit<
      WorkoutDocument,
      'id' | 'createdAt'
    >),

    id: snap.id,

    createdAt:
      snap.data().createdAt?.toDate(),
  }
}