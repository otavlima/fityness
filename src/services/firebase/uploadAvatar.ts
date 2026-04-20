import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

export const uploadAvatar = async (uid: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `avatars/${uid}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}