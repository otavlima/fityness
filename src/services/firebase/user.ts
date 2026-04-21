import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore"
import { db } from "../firebase"
import { userSchema, type User } from "@/schemas/userSchema"
import { updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth } from "../firebase"

export const createUser = async (data: Omit<User, "uid" | "createdAt">, uid: string) => {
  const user = userSchema.parse({
    ...data,
    uid,
    createdAt: new Date(),
  })
  await setDoc(doc(db, "users", uid), user)
}

export const getUser = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, "users", uid))
  if (!snap.exists()) return null
  return snap.data() as User
}

export const updateUser = async (uid: string, data: Partial<Omit<User, "uid" | "createdAt">>) => {
  await updateDoc(doc(db, "users", uid), data)
}

export const deleteUser = async (uid: string) => {
  const batch = writeBatch(db)

  const collections = ["workouts", "history", "progress"]

  for (const col of collections) {
    const q = query(collection(db, col), where("uid", "==", uid))
    const snap = await getDocs(q)
    snap.docs.forEach(d => batch.delete(d.ref))
  }

  batch.delete(doc(db, "users", uid))

  await batch.commit()
}

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('User not found')

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await firebaseUpdatePassword(user, newPassword)
}