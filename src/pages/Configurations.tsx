import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { Sun, Moon, Sparkles, CornerUpRight, Eye, EyeOff, Loader2, Camera } from 'lucide-react'
import { useState, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import { deleteUser, updatePassword } from '@/services/firebase/user'
import { updateProfile, deleteUser as deleteAuthUser } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { toast } from 'sonner'
import Loading from '@/components/Loading'
import { useUserProfile } from '@/contexts/UserProfileContext'

const Configurations = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage } = useLanguage()
  const { profile, avatarUrl, uploadingAvatar, setProfile, updateProfileData, updateAvatar } = useUserProfile()

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const handleSaveProfile = async () => {
    if (!user || !profile) return
    setSavingProfile(true)
    try {
      await updateProfileData({ name: profile.name, username: profile.username })
      await updateProfile(auth.currentUser!, { displayName: profile.name })
      toast.success('Profile updated!')
    } catch {
      toast.error('Error updating profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await updateAvatar(file)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error uploading avatar.')
    }
  }

  const handleSavePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (passwords.newPass.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword(passwords.current, passwords.newPass)
      setPasswords({ current: '', newPass: '', confirm: '' })
      toast.success('Password updated!')
    } catch {
      toast.error('Current password is incorrect.')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeletingAccount(true)
    try {
      await deleteUser(user.uid)
      await deleteAuthUser(auth.currentUser!)
      await logout()
    } catch {
      toast.error('Error deleting account. Please re-login and try again.')
      setDeletingAccount(false)
      setOpenDelete(false)
    }
  }

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center max-[1070px]:px-4">
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          <Field className="flex flex-col gap-1">
            <FieldDescription className="text-xs font-semibold tracking-widest uppercase">Account</FieldDescription>
            <FieldTitle className="text-3xl font-semibold tracking-tight">Configurations</FieldTitle>
            <FieldDescription>Manage your profile, preferences and plan.</FieldDescription>
          </Field>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-semibold tracking-tight">Profile</CardTitle>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loading text="Saving" isCol={false} /> : 'Save changes'}
              </Button>
            </CardHeader>
            <div className="w-full h-[1px] bg-sidebar-border" />
            <CardContent className="flex gap-12 max-[768px]:flex-col">
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => !uploadingAvatar && fileInputRef.current?.click()}>
                <div className="relative group">
                  <Avatar className="w-20 h-20 max-[768px]:w-40 max-[768px]:h-40">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition
                    ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploadingAvatar
                      ? <Loader2 size={16} className="animate-spin text-white" />
                      : <span className="text-white text-xs"><Camera /></span>
                    }
                  </div>
                </div>
                <FieldDescription className="text-xs text-center">JPG or PNG</FieldDescription>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-2">
                  <Field>
                    <FieldTitle>Name</FieldTitle>
                    <Input value={profile?.name ?? ''} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : null)} className="w-full" />
                  </Field>
                  <Field>
                    <FieldTitle>Username</FieldTitle>
                    <Input value={profile?.username ?? ''} onChange={e => setProfile(p => p ? { ...p, username: e.target.value } : null)} className="w-full" />
                  </Field>
                </div>
                <Field>
                  <FieldTitle>Email</FieldTitle>
                  <Input value={profile?.email ?? ''} disabled className="w-full opacity-60" />
                </Field>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight">Preferences</CardTitle>
            </CardHeader>
            <div className="w-full h-[1px] bg-sidebar-border" />
            <CardContent className="flex gap-8">
              <Field className="flex flex-col gap-1 flex-1">
                <FieldTitle className="text-lg ml-1">Theme</FieldTitle>
                <FieldDescription className="ml-1">Change the theme to light or dark.</FieldDescription>
                <Button onClick={toggleTheme} variant="ghost" className="border border-muted max-w-24 mt-4">
                  {theme === 'light' ? <><Sun className="w-4 h-4" /> Light</> : <><Moon className="w-4 h-4" /> Dark</>}
                </Button>
              </Field>
              <Field className="flex flex-col gap-1 flex-1">
                <FieldTitle className="text-lg">Language</FieldTitle>
                <FieldDescription>Select your language.</FieldDescription>
                <Select value={language} onValueChange={changeLanguage}>
                  <SelectTrigger className="mt-auto max-w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>
          <div className="rounded-xl bg-primary p-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-background" />
                <span className="text-xs font-bold tracking-widest text-background">FITY.NESS WITH AI</span>
              </div>
              <Button variant="secondary" className="max-w-32">Get Started <CornerUpRight /></Button>
            </div>
            <Field className="flex flex-col gap-1">
              <FieldTitle className="text-background text-2xl">Elevate your evolution</FieldTitle>
              <FieldDescription className="text-sm text-background/80">Unlock an intelligent assistant and get answers...</FieldDescription>
            </Field>
          </div>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-semibold tracking-tight">Security</CardTitle>
              <Button onClick={handleSavePassword} disabled={savingPassword}>
                {savingPassword ? <Loading text="Saving" isCol={false} /> : 'Save changes'}
              </Button>
            </CardHeader>
            <div className="w-full h-[1px] bg-sidebar-border" />
            <CardContent>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-2">
                  <Field>
                    <FieldTitle>Password</FieldTitle>
                    <div className="relative">
                      <Input type={showCurrent ? 'text' : 'password'} placeholder="********" autoComplete="new-password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
                      <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldTitle>New password</FieldTitle>
                    <div className="relative">
                      <Input type={showNew ? 'text' : 'password'} placeholder="********" autoComplete="new-password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
                      <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                </div>
                <Field>
                  <FieldTitle>Confirm new password</FieldTitle>
                  <div className="relative">
                    <Input type={showConfirm ? 'text' : 'password'} placeholder="********" autoComplete="new-password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight">Danger zone</CardTitle>
            </CardHeader>
            <div className="w-full h-[1px] bg-sidebar-border" />
            <CardContent className="flex justify-between items-center">
              <Field className="flex flex-col gap-1">
                <FieldTitle>Delete account</FieldTitle>
                <FieldDescription>This action is permanent and cannot be undone.</FieldDescription>
              </Field>
              <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and cannot be undone. Your account and all associated data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={e => { e.preventDefault(); handleDeleteAccount() }}
                      disabled={deletingAccount}
                      variant="destructive"
                    >
                      {deletingAccount ? <Loading text="Deleting" isCol={false} /> : 'Delete account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </Header>
  )
}

export default Configurations