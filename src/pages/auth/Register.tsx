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
import {
  registerSchema,
  type RegisterSchema
} from "@/schemas/registerSchema"
import { z } from "zod"
import Loading from "@/components/Loading"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"

type IErrors = Partial<Record<keyof RegisterSchema, string>>

const Register = () => {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  const [user, setUser] = useState<RegisterSchema>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<IErrors>({})
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // STEP 1
  const handleNext = () => {
    const partial = z.object({
      name: registerSchema.shape.name,
      username: registerSchema.shape.username,
    })

    const result = partial.safeParse(user)

    if (!result.success) {
      const fieldErrors: IErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterSchema
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setDirection(1)
    setStep(2)
  }

  const handleBack = () => {
    setDirection(-1)
    setStep(1)
  }

  // REGISTER FINAL
  const handleRegister = async () => {
    const result = registerSchema.safeParse(user)

    if (!result.success) {
      const fieldErrors: IErrors = {}
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const field = issue.path[0] as keyof RegisterSchema
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await register(user.name, user.username, user.email, user.password)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already in use.' })
        return
      }

      toast.error('Error creating account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-md max-[480px]:w-full max-[480px]:mx-4">
        <CardHeader>
          <h1 className="text-3xl font-bold text-primary">Fity.ness - Sign up</h1>
          <Separator className="mt-4"/>
          <div className="flex justify-between items-center mt-4">
            <div>
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Register to Fity.ness and work out with us!
              </CardDescription>
            </div>

            <Link
              to="/login"
              className="p-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/80 transition"
            >
              Sign in
            </Link>
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <div className="relative border rounded-lg overflow-hidden flex text-sm font-medium">
            <motion.div
              className="absolute top-0 left-0 h-full w-1/2 bg-primary/10"
              animate={{ x: step === 1 ? "0%" : "100%" }}
              transition={{ duration: 0.25 }}
            />
            <div className={`flex-1 text-center py-2 z-10 ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
              1. Info
            </div>
            <div className="w-px bg-border z-10" />
            <div className={`flex-1 text-center py-2 z-10 ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              2. Account
            </div>
          </div>
        </div>
        <CardContent className="relative overflow-hidden min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: direction === 1 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -80 : 80, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              {step === 1 && (
                <>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      placeholder="John Doe"
                      value={user.name}
                      onChange={e => setUser(o => ({ ...o, name: e.target.value }))}
                      className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.name
                      ? <p className="text-destructive text-sm">{errors.name}</p>
                      : <FieldDescription>Enter your full name.</FieldDescription>}
                  </Field>
                  <Field>
                    <FieldLabel>Username</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">@</span>
                      <Input
                        placeholder="johndoe"
                        value={user.username}
                        onChange={e => setUser(o => ({ ...o, username: e.target.value }))}
                        className={errors.username
                          ? 'border-destructive focus-visible:ring-destructive pl-7'
                          : 'pl-7'}
                      />
                    </div>
                    {errors.username
                      ? <p className="text-destructive text-sm">{errors.username}</p>
                      : <FieldDescription>Enter your username.</FieldDescription>}
                  </Field>
                </>
              )}
              {step === 2 && (
                <>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      placeholder="name@example.com"
                      value={user.email}
                      onChange={e => setUser(o => ({ ...o, email: e.target.value }))}
                      className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.email
                      ? <p className="text-destructive text-sm">{errors.email}</p>
                      : <FieldDescription>We might send notifications.</FieldDescription>}
                  </Field>
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={user.password}
                        onChange={e => setUser(o => ({ ...o, password: e.target.value }))}
                        className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  </Field>
                  <Field>
                    <FieldLabel>Confirm password</FieldLabel>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Enter your password again"
                        value={user.confirmPassword}
                        onChange={e => setUser(o => ({ ...o, confirmPassword: e.target.value }))}
                        className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword
                      ? <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                      : <FieldDescription>Use a strong password to avoid risks.</FieldDescription>}
                  </Field>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          )}
          <div className="ml-auto">
            {step === 1 ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? <Loading text="Registering" isCol={false}/> : "Register"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register