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
import { Sun, Moon, Eye, EyeOff, Loader2, Camera } from 'lucide-react'
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
import { useTranslation } from 'react-i18next'

const Configurations = () => {
  const { t } = useTranslation()

  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage } = useLanguage()

  const {
    profile,
    avatarUrl,
    uploadingAvatar,
    setProfile,
    updateProfileData,
    updateAvatar,
  } = useUserProfile()

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  const [showCurrent, setShowCurrent] =
    useState(false)

  const [showNew, setShowNew] =
    useState(false)

  const [showConfirm, setShowConfirm] =
    useState(false)

  const [savingProfile, setSavingProfile] =
    useState(false)

  const [savingPassword, setSavingPassword] =
    useState(false)

  const [deletingAccount, setDeletingAccount] =
    useState(false)

  const [openDelete, setOpenDelete] =
    useState(false)

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    setSavingProfile(true)

    try {
      await updateProfileData({
        name: profile.name,
        username: profile.username,
      })

      await updateProfile(auth.currentUser!, {
        displayName: profile.name,
      })

      toast.success(
        t('configurations.profile.saved')
      )
    } catch {
      toast.error(
        t('configurations.profile.error')
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      await updateAvatar(file)

      toast.success(
        t('configurations.profile.saved')
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t('configurations.profile.error')
      )
    }
  }

  const handleSavePassword = async () => {
    if (
      passwords.newPass !==
      passwords.confirm
    ) {
      toast.error(
        t('configurations.security.mismatch')
      )

      return
    }

    if (passwords.newPass.length < 6) {
      toast.error(
        t('configurations.security.minLength')
      )

      return
    }

    setSavingPassword(true)

    try {
      await updatePassword(
        passwords.current,
        passwords.newPass
      )

      setPasswords({
        current: '',
        newPass: '',
        confirm: '',
      })

      toast.success(
        t('configurations.security.saved')
      )
    } catch {
      toast.error(
        t('configurations.security.error')
      )
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setDeletingAccount(true)

    try {
      await deleteUser(user.uid)

      await deleteAuthUser(
        auth.currentUser!
      )

      await logout()
    } catch {
      toast.error(
        'Error deleting account. Please re-login and try again.'
      )

      setDeletingAccount(false)
      setOpenDelete(false)
    }
  }

  return (
    <Header>
      <div className="flex flex-1 w-full justify-center max-[1070px]:px-4">
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          <Field className="flex flex-col gap-1">
            <FieldDescription className="text-xs font-semibold tracking-widest uppercase">
              {t('configurations.sections.account')}
            </FieldDescription>

            <FieldTitle className="text-3xl font-semibold tracking-tight">
              {t('configurations.title')}
            </FieldTitle>

            <FieldDescription>
              {t('configurations.description')}
            </FieldDescription>
          </Field>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-semibold tracking-tight">
                {t('configurations.profile.title')}
              </CardTitle>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <Loading
                    text="Saving"
                    isCol={false}
                  />
                ) : (
                  t('configurations.profile.save')
                )}
              </Button>
            </CardHeader>

            <div className="w-full h-[1px] bg-sidebar-border" />

            <CardContent className="flex gap-12 max-[768px]:flex-col">
              <div
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() =>
                  !uploadingAvatar &&
                  fileInputRef.current?.click()
                }
              >
                <div className="relative group">
                  <Avatar className="w-20 h-20 max-[768px]:w-40 max-[768px]:h-40">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt="Avatar"
                      />
                    )}

                    <AvatarFallback className="text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition
                    ${
                      uploadingAvatar
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {uploadingAvatar ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-white"
                      />
                    ) : (
                      <span className="text-white text-xs">
                        <Camera />
                      </span>
                    )}
                  </div>
                </div>

                <FieldDescription className="text-xs text-center">
                  {t(
                    'configurations.profile.avatarHint'
                  )}
                </FieldDescription>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-2">
                  <Field>
                    <FieldTitle>
                      {t(
                        'configurations.profile.name'
                      )}
                    </FieldTitle>

                    <Input
                      value={profile?.name ?? ''}
                      onChange={(e) =>
                        setProfile((p) =>
                          p
                            ? {
                                ...p,
                                name:
                                  e.target.value,
                              }
                            : null
                        )
                      }
                      className="w-full"
                    />
                  </Field>

                  <Field>
                    <FieldTitle>
                      {t(
                        'configurations.profile.username'
                      )}
                    </FieldTitle>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground text-sm">
                        @
                      </span>

                      <Input
                        value={
                          profile?.username ?? ''
                        }
                        onChange={(e) =>
                          setProfile((p) =>
                            p
                              ? {
                                  ...p,
                                  username:
                                    e.target.value,
                                }
                              : null
                          )
                        }
                        className="w-full pl-7"
                      />
                    </div>
                  </Field>
                </div>

                <Field>
                  <FieldTitle>
                    {t(
                      'configurations.profile.email'
                    )}
                  </FieldTitle>

                  <Input
                    value={profile?.email ?? ''}
                    disabled
                    className="w-full opacity-60"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight">
                {t(
                  'configurations.sections.preferences'
                )}
              </CardTitle>
            </CardHeader>

            <div className="w-full h-[1px] bg-sidebar-border" />

            <CardContent className="flex gap-8">
              <Field className="flex flex-col gap-1 flex-1">
                <FieldTitle className="text-lg ml-1">
                  {t(
                    'configurations.preferences.theme'
                  )}
                </FieldTitle>

                <FieldDescription className="ml-1">
                  {t(
                    'configurations.preferences.themeDescription'
                  )}
                </FieldDescription>

                <Button
                  onClick={toggleTheme}
                  variant="ghost"
                  className="border border-muted max-w-24 mt-4"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-4 h-4" />
                      {t(
                        'configurations.preferences.light'
                      )}
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      {t(
                        'configurations.preferences.dark'
                      )}
                    </>
                  )}
                </Button>
              </Field>

              <Field className="flex flex-col gap-1 flex-1">
                <FieldTitle className="text-lg">
                  {t(
                    'configurations.preferences.language'
                  )}
                </FieldTitle>

                <FieldDescription>
                  {t(
                    'configurations.preferences.languageDescription'
                  )}
                </FieldDescription>

                <Select
                  value={language}
                  onValueChange={changeLanguage}
                >
                  <SelectTrigger className="mt-auto max-w-40">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="en">
                      English
                    </SelectItem>

                    <SelectItem value="pt">
                      Português
                    </SelectItem>

                    <SelectItem value="es">
                      Español
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-semibold tracking-tight">
                {t(
                  'configurations.sections.security'
                )}
              </CardTitle>

              <Button
                onClick={handleSavePassword}
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <Loading
                    text="Saving"
                    isCol={false}
                  />
                ) : (
                  t(
                    'configurations.security.save'
                  )
                )}
              </Button>
            </CardHeader>

            <div className="w-full h-[1px] bg-sidebar-border" />

            <CardContent>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-2">
                  <Field>
                    <FieldTitle>
                      {t(
                        'configurations.security.password'
                      )}
                    </FieldTitle>

                    <div className="relative">
                      <Input
                        type={
                          showCurrent
                            ? 'text'
                            : 'password'
                        }
                        placeholder="********"
                        autoComplete="new-password"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            current:
                              e.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrent(
                            (p) => !p
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showCurrent ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field>
                    <FieldTitle>
                      {t(
                        'configurations.security.newPassword'
                      )}
                    </FieldTitle>

                    <div className="relative">
                      <Input
                        type={
                          showNew
                            ? 'text'
                            : 'password'
                        }
                        placeholder="********"
                        autoComplete="new-password"
                        value={passwords.newPass}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            newPass:
                              e.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNew((p) => !p)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showNew ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>

                <Field>
                  <FieldTitle>
                    {t(
                      'configurations.security.confirmPassword'
                    )}
                  </FieldTitle>

                  <div className="relative">
                    <Input
                      type={
                        showConfirm
                          ? 'text'
                          : 'password'
                      }
                      placeholder="********"
                      autoComplete="new-password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          confirm:
                            e.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(
                          (p) => !p
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showConfirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight">
                {t(
                  'configurations.sections.dangerZone'
                )}
              </CardTitle>
            </CardHeader>

            <div className="w-full h-[1px] bg-sidebar-border" />

            <CardContent className="flex justify-between items-center">
              <Field className="flex flex-col gap-1">
                <FieldTitle>
                  {t(
                    'configurations.danger.title'
                  )}
                </FieldTitle>

                <FieldDescription>
                  {t(
                    'configurations.danger.description'
                  )}
                </FieldDescription>
              </Field>

              <AlertDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {t(
                      'configurations.danger.button'
                    )}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t(
                        'configurations.danger.confirmTitle'
                      )}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                      {t(
                        'configurations.danger.confirmDescription'
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={deletingAccount}
                    >
                      {t(
                        'configurations.danger.cancel'
                      )}
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteAccount()
                      }}
                      disabled={deletingAccount}
                      variant="destructive"
                    >
                      {deletingAccount ? (
                        <Loading
                          text="Deleting"
                          isCol={false}
                        />
                      ) : (
                        t(
                          'configurations.danger.button'
                        )
                      )}
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