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

export const updateWorkout = async (
  id: string,
  data: Partial<Workout>
) => {
  await updateDoc(
    doc(db, COLLECTION, id),
    { ...data }
  )
}

export const deleteWorkout = async (
  id: string
) => {
  const batch = writeBatch(db)

  const workoutRef = doc(
    db,
    COLLECTION,
    id
  )

  const schedulesQuery = query(
    collection(db, "schedules"),
    where("workoutId", "==", id)
  )

  const schedulesSnap =
    await getDocs(schedulesQuery)

  const scheduleIds =
    schedulesSnap.docs.map(doc => doc.id)

  schedulesSnap.docs.forEach(scheduleDoc => {
    batch.delete(scheduleDoc.ref)
  })

  if (scheduleIds.length > 0) {
    const completedQuery = query(
      collection(db, "schedule_status"),
      where("scheduleId", "in", scheduleIds)
    )

    const completedSnap =
      await getDocs(completedQuery)

    completedSnap.docs.forEach(statusDoc => {
      batch.delete(statusDoc.ref)
    })
  }

  batch.delete(workoutRef)

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