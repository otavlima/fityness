import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUser, updateUser } from '@/services/firebase/user'
import { type User } from '@/schemas/userSchema'

interface ProfileData {
  name: string
  username: string
  email: string
  photoURL?: string
}

interface UserProfileContextType {
  profile: ProfileData | null
  avatarUrl: string | null
  loading: boolean
  uploadingAvatar: boolean
  setProfile: (data: ProfileData | ((prev: ProfileData | null) => ProfileData | null)) => void
  updateProfileData: (data: Partial<Omit<User, 'uid' | 'createdAt'>>) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | null>(null)

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user }                              = useAuth()
  const [profile, setProfile]                 = useState<ProfileData | null>(null)
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setAvatarUrl(null)
      setLoading(false)
      return
    }
    getUser(user.uid).then(data => {
      if (data) {
        setProfile({ name: data.name, username: data.username, email: data.email, photoURL: data.photoURL })
        setAvatarUrl(data.photoURL ?? null)
      }
      setLoading(false)
    })
  }, [user])

  const updateProfileData = async (data: Partial<Omit<User, 'uid' | 'createdAt'>>) => {
    if (!user) return
    await updateUser(user.uid, data)
    setProfile(old => old ? { ...old, ...data } : null)
  }

  const updateAvatar = async (file: File) => {
    if (!user) return
    if (file.size > 500 * 1024) throw new Error('Image must be smaller than 500KB.')

    setUploadingAvatar(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      await updateUser(user.uid, { photoURL: base64 })
      setAvatarUrl(base64)
      setProfile(old => old ? { ...old, photoURL: base64 } : null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <UserProfileContext.Provider value={{ profile, avatarUrl, loading, uploadingAvatar, setProfile, updateProfileData, updateAvatar }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext)
  if (!context) throw new Error('useUserProfile must be used within UserProfileProvider')
  return context
}