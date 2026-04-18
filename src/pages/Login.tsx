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
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

interface IUser {
  email: string
  password: string
}

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [user, setUser] = useState<IUser>({ email: "", password: "" });

    const handleLogin = async () => {
        try {
            await login(user.email, user.password)
            navigate("/")
        } catch(err) {
            console.error('Credenciais inválidas', err)
        }
    }

    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <h1 className="text-3xl font-bold text-primary">Fitify</h1>
            <div className="w-96 max-[480px]:w-48 h-[1px] bg-muted"></div>
            <Card className="max-[480px]:mx-4">
                <CardHeader className="flex justify-between">
                   <div>
                      <CardTitle className="text-xl">Login</CardTitle>
                      <CardDescription>Login to Fitify and work out with us!</CardDescription>
                   </div>
                    <Link className="p-2 rounded-2xl bg-accent hover:bg-muted transition duration-300 cursor-pointer" to="/register">Sign up</Link>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="youremail@gmail.com" value={user.email} onChange={e => setUser(old => ({ ...old, email: e.target.value }))}/>
                        <FieldDescription>This email address must be valid, we might send notifications.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" autoComplete="off" placeholder="********" value={user.password} onChange={e => setUser(old => ({ ...old, password: e.target.value }))}/>
                        <FieldDescription>Use a strong password.</FieldDescription>
                    </Field>
                </CardContent>
                <Button onClick={handleLogin} className="mx-4">Login</Button>
                <CardFooter>
                    <p>All rights reserved 2026. © Fitify</p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login