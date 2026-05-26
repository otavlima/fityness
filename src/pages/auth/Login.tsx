import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import { loginSchema, type LoginSchema } from "@/schemas/loginSchema"
import { z } from "zod"
import Loading from "@/components/Loading"
import { Separator } from "@/components/ui/separator"

type IErrors = Partial<Record<keyof LoginSchema, string>>

const Login = () => {
  const { t } = useTranslation()
  const { login }   = useAuth()
  const [loading, setLoading] = useState(false)
  const navigate    = useNavigate()
  const [user, setUser]     = useState<LoginSchema>({ email: '', password: '' })
  const [errors, setErrors] = useState<IErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    const result = loginSchema.safeParse(user)

    if (!result.success) {
      const fieldErrors: IErrors = {}
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const field = issue.path[0] as keyof LoginSchema
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await login(user.email, user.password)
      toast.success(t('login.messages.success'))
      navigate('/')
    } catch {
      toast.error(t('login.messages.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-md max-[480px]:w-full max-[480px]:mx-4">
        <CardHeader>
          <h1 className="text-3xl font-bold text-primary">{t('login.title')}</h1>
          <Separator className="mt-4"/>
        </CardHeader>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle className="text-xl">{t('login.cardTitle')}</CardTitle>
            <CardDescription>{t('login.description')}</CardDescription>
          </div>
          <Link className="p-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/80 transition duration-300 cursor-pointer" to="/register">{t('login.signUpLink')}</Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Field>
            <FieldLabel htmlFor="email">{t('login.emailLabel')}</FieldLabel>
            <Input
              id="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={user.email}
              onChange={e => setUser(old => ({ ...old, email: e.target.value }))}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.email
              ? <p className="text-destructive text-sm">{errors.email}</p>
              : <FieldDescription>{t('login.emailDescription')}</FieldDescription>
            }
          </Field>
          <Field>
            <FieldLabel htmlFor="password">{t('login.passwordLabel')}</FieldLabel>
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="********"
                    value={user.password}
                    onChange={e => setUser(old => ({ ...old, password: e.target.value }))}
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(old => !old)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {errors.password
              ? <p className="text-destructive text-sm">{errors.password}</p>
              : <FieldDescription>{t('login.passwordDescription')}</FieldDescription>
            }
          </Field>
        </CardContent>
        <Button onClick={handleLogin} disabled={loading} className="mx-4">
          {loading ? <Loading text={t('login.connecting')} isCol={false} /> : t('login.button')}
        </Button>
        <CardFooter>
          <p className="font-medium">{t('login.footer')}</p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login