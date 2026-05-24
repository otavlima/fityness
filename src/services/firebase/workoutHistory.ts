import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  startAfter,
  writeBatch,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"

import { db } from "../firebase"

export interface SetResult {
  setIndex: number
  kg: number
  reps: number
  done: boolean
}

export interface ExerciseResult {
  exerciseId: string
  exerciseName: string
  sets: SetResult[]
}

export interface WorkoutHistoryDocument {
  id: string
  uid: string
  workoutId: string
  workoutName: string
  exercises: ExerciseResult[]
  duration: number
  completedAt: Date
}

export const updateWorkoutNameInHistory = async (
  uid: string,
  workoutId: string,
  newName: string
): Promise<void> => {
  const q = query(
    collection(db, "workout_history"),
    where("uid", "==", uid),
    where("workoutId", "==", workoutId)
  )

  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { workoutName: newName }))
  await batch.commit()
}

export const saveWorkoutHistory = async (
  uid: string,
  data: Omit<WorkoutHistoryDocument, "id" | "completedAt">
): Promise<string> => {
  const ref = await addDoc(
    collection(db, "workout_history"),
    {
      ...data,
      uid,
      completedAt: Timestamp.now(),
    }
  )

  return ref.id
}

export const getWorkoutHistory = async (
  uid: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
) => {
  const constraints: any[] = [
    where("uid", "==", uid),
    orderBy("completedAt", "desc"),
    limit(10),
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const q = query(collection(db, "workout_history"), ...constraints)

  const snap = await getDocs(q)

  const normalizeDate = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  return {
    history: snap.docs.map(d => {
      const raw = d.data().completedAt

      const completedAt =
        raw?.toDate?.() ??
        (raw instanceof Date ? raw : new Date(raw))

      return {
        ...(d.data() as Omit<
          WorkoutHistoryDocument,
          "id" | "completedAt"
        >),

        id: d.id,
        completedAt,
      }
    }),

    lastDoc: snap.docs[snap.docs.length - 1] || null,

    hasMore: snap.docs.length === 10,
  }
}

export const getLastWorkoutHistory = async (
  uid: string,
  workoutId: string
): Promise<WorkoutHistoryDocument | null> => {
  const q = query(
    collection(db, "workout_history"),
    where("uid", "==", uid),
    where("workoutId", "==", workoutId)
  )

  const snap = await getDocs(q)

  if (snap.empty) return null

  const docs = snap.docs.map(doc => {
    const raw = doc.data().completedAt

    const completedAt =
      raw?.toDate?.() ??
      (raw instanceof Date ? raw : new Date(raw))

    return {
      ...(doc.data() as Omit<
        WorkoutHistoryDocument,
        "id" | "completedAt"
      >),

      id: doc.id,
      completedAt,
    }
  })

  docs.sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  )

  return docs[0]
}