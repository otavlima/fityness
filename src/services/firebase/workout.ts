import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import { type Workout } from "@/schemas/workoutSchema"

const COLLECTION = "workouts"

export interface WorkoutDocument extends Workout {
  id: string
  uid: string
  createdAt: Date
  lastDone?: string
}

export const createWorkout = async (uid: string, data: Workout): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    uid,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export const getWorkouts = async (uid: string): Promise<WorkoutDocument[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid)
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({
    ...(doc.data() as Omit<WorkoutDocument, 'id' | 'createdAt'>),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
  }))
}

export const updateWorkout = async (id: string, data: Partial<Workout>) => {
  await updateDoc(doc(db, COLLECTION, id), { ...data })
}

export const deleteWorkout = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id))
}