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
import { Link } from "react-router-dom"

const Register = () => {
    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <h1 className="text-3xl font-bold text-primary">Fitify</h1>
            <div className="w-96 max-[480px]:w-48 h-[1px] bg-gray-200"></div>
            <Card className="max-[480px]:mx-4">
                <CardHeader className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">Create your account</CardTitle>
                      <CardDescription>Register to Fitify and work out with us!</CardDescription>
                    </div>
                    <Link className="p-2 rounded-2xl bg-accent hover:bg-gray-200 transition duration-300 cursor-pointer" to="/login">Sign in</Link>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                     <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="John Doe" />
                        <FieldDescription>Enter your full name.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="youremail@gmail.com" />
                        <FieldDescription>This email address must be valid, we might send notifications.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" autoComplete="off" placeholder="********" />
                    </Field>
                     <Field>
                        <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                        <Input id="confirm-password" autoComplete="off" placeholder="Enter your password again" />
                        <FieldDescription>Use a strong password.</FieldDescription>
                    </Field>
                </CardContent>
                <Button className="mx-4">Create Account</Button>
                <CardFooter>
                    <p>All rights reserved 2026. © Fitify</p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Register