import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { getWorkoutHistory } from './workoutHistory'
import { db } from '../firebase'
import {
  userSchema,
  type User,
} from '@/schemas/userSchema'
import {
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'

export const createUser = async (
  data: Omit<
    User,
    | 'uid'
    | 'createdAt'
    | 'streak'
    | 'streakDates'
  >,
  uid: string
) => {
  const today = new Date()
    .toISOString()
    .split('T')[0]

  const user = userSchema.parse({
    ...data,

    uid,

    createdAt: new Date(),

    streak: 1,

    streakDates: [today],
  })

  await setDoc(
    doc(db, 'users', uid),
    user
  )
}

export const getUser = async (
  uid: string
): Promise<User | null> => {
  const snap = await getDoc(
    doc(db, 'users', uid)
  )

  if (!snap.exists())
    return null

  return snap.data() as User
}

export const updateUser = async (
  uid: string,
  data: Partial<
    Omit<
      User,
      'uid' | 'createdAt'
    >
  >
) => {
  await updateDoc(
    doc(db, 'users', uid),
    data
  )
}

export const updateUserStreak =
  async (uid: string) => {
    const userRef = doc(
      db,
      'users',
      uid
    )

    const snap =
      await getDoc(userRef)

    if (!snap.exists())
      return

    const user =
      snap.data() as User

    const today = new Date()
      .toISOString()
      .split('T')[0]

    const yesterdayDate =
      new Date()

    yesterdayDate.setDate(
      yesterdayDate.getDate() -
        1
    )

    const yesterday =
      yesterdayDate
        .toISOString()
        .split('T')[0]

    const streakDates =
      user.streakDates || []

    if (
      streakDates.includes(
        today
      )
    ) {
      return
    }

    const hasYesterday =
      streakDates.includes(
        yesterday
      )

    const newStreak =
      hasYesterday
        ? (user.streak || 0) + 1
        : 1

    await updateDoc(userRef, {
      streak: newStreak,

      streakDates: [
        ...streakDates,
        today,
      ],
    })
  }

export const deleteUser = async (uid: string) => {
  const batch = writeBatch(db)

  const collections = ['workouts', 'schedules', 'schedule_status', 'workout_history']

  for (const col of collections) {
    const snap = await getDocs(
      query(collection(db, col), where('uid', '==', uid))
    )
    snap.docs.forEach(d => batch.delete(d.ref))
  }

  batch.delete(doc(db, 'users', uid))
  await batch.commit()
}

export const updatePassword =
  async (
    currentPassword: string,
    newPassword: string
  ) => {
    const user =
      auth.currentUser

    if (
      !user ||
      !user.email
    ) {
      throw new Error(
        'User not found'
      )
    }

    const credential =
      EmailAuthProvider.credential(
        user.email,
        currentPassword
      )

    await reauthenticateWithCredential(
      user,
      credential
    )

    await firebaseUpdatePassword(
      user,
      newPassword
    )
  }

export const updateUserStreakFromHistory = async (uid: string) => {
  const { history } = await getWorkoutHistory(uid)

  if (!history || history.length === 0) {
    await updateDoc(doc(db, 'users', uid), {
      streak: 0,
    })
    return
  }

  const normalize = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const days = new Set(
    history.map(h => {
      const date =
        h.completedAt instanceof Date
          ? h.completedAt
          : new Date(h.completedAt)

      return normalize(date)
    })
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let current = new Date(today)

  while (days.has(current.getTime())) {
    streak++
    current.setDate(current.getDate() - 1)
  }

  await updateDoc(doc(db, 'users', uid), {
    streak,
  })
}

export const getStreak = async (uid: string): Promise<number> => {
  const { history } = await getWorkoutHistory(uid)

  const days = new Set(
    history.map(h =>
      new Date(h.completedAt).toISOString().split('T')[0]
    )
  )

  let streak = 0
  const current = new Date()

  while (true) {
    const day = current.toISOString().split('T')[0]

    if (!days.has(day)) break

    streak++
    current.setDate(current.getDate() - 1)
  }

  return streak
}