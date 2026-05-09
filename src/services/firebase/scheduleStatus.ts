import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore"

import { db } from "../firebase"

const COLLECTION = "schedule_status"

export interface ScheduleStatusDocument {
  id: string
  uid: string
  eventId: string
  scheduleId: string
  completed: boolean
}

export const getCompletedEventIds = async (
  uid: string
): Promise<string[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    where("completed", "==", true)
  )

  const snap = await getDocs(q)

  return snap.docs.map(doc => doc.data().eventId)
}

export const markEventCompleted = async (
  uid: string,
  eventId: string,
  scheduleId: string
) => {
  await addDoc(collection(db, COLLECTION), {
    uid,
    eventId,
    scheduleId,
    completed: true,
  })
}

export const unmarkEventCompleted = async (
  uid: string,
  eventId: string
) => {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    where("eventId", "==", eventId)
  )

  const snap = await getDocs(q)

  await Promise.all(
    snap.docs.map(d =>
      deleteDoc(doc(db, COLLECTION, d.id))
    )
  )
}