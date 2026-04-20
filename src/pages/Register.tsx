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
import { registerSchema, type RegisterSchema } from "@/schemas/registerSchema"
import { z } from "zod"
import { FirebaseError } from "firebase/app"
import Loading from "@/components/Loading"

type IErrors = Partial<Record<keyof RegisterSchema, string>>

const Register = () => {
    const [user, setUser] = useState<RegisterSchema>({ name: '', username: '', email: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [errors, setErrors] = useState<IErrors>({})

    const handleRegister = async () => {
        console.log('handleRegister chamado')
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
        } catch (err) {
          if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
            setErrors({ email: 'This email is already in use.' })
          } else {
            toast.error('Error creating account.')
          }
        } finally {
          setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-md max-[480px]:w-full max-[480px]:mx-4">
                <CardHeader>
                    <h1 className="text-3xl font-bold text-primary">Fitify - Sign up</h1>
                    <div className="w-full mt-4 h-[1px] bg-muted"></div>
                </CardHeader>
                <CardHeader className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">Create your account</CardTitle>
                      <CardDescription>Register to Fitify and work out with us!</CardDescription>
                    </div>
                    <Link className="p-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/80 transition duration-300 cursor-pointer" to="/login">Sign in</Link>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                     <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                            id="name"
                            autoComplete="off"
                            placeholder="John Doe"
                            value={user.name}
                            onChange={e => setUser(old => ({ ...old, name: e.target.value }))}
                            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.name
                            ? <p className="text-destructive text-sm">{errors.name}</p>
                            : <FieldDescription>Enter your full name.</FieldDescription>
                        }
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                autoComplete="off"
                                placeholder="@johndoe"
                                value={user.username}
                                onChange={e => setUser(old => ({ ...old, username: e.target.value }))}
                                className={errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.username
                                ? <p className="text-destructive text-sm">{errors.username}</p>
                                : <FieldDescription>Enter your username.</FieldDescription>
                            }
                        </Field>
                        <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
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
                            : <FieldDescription>We might send notifications.</FieldDescription>
                        }
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
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
                            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="off"
                                    placeholder="Enter your password again"
                                    value={user.confirmPassword}
                                    onChange={e => setUser(old => ({ ...old, confirmPassword: e.target.value }))}
                                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(old => !old)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                             </div>
                            {errors.confirmPassword
                                ? <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                                : <FieldDescription>Use a strong password to avoid risks.</FieldDescription>
                            }
                        </Field>
                </CardContent>
                <Button onClick={() => {
                    handleRegister()}} disabled={loading} className="mx-4">{loading ? <Loading text="Registering" isCol={false}/> : "Register"}
                </Button>
                <CardFooter>
                    <p className="font-medium">All rights reserved 2026. © Fitify</p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Register