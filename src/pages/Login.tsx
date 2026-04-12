import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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

const Login = () => {
    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <h1 className="text-3xl font-bold text-primary">Fitify</h1>
            <div className="w-96 max-[480px]:w-48 h-[1px] bg-gray-200"></div>
            <Card className="max-[480px]:mx-4">
                <CardHeader>
                    <CardTitle className="text-xl">Login</CardTitle>
                    <CardDescription>Login to Fitify and work out with us!</CardDescription>
                    <CardAction className="p-2 rounded-2xl bg-accent hover:bg-gray-200 transition duration-300 cursor-pointer">Sign up</CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="youremail@gmail.com" />
                        <FieldDescription>This email address must be valid, we might send notifications.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username">Password</FieldLabel>
                        <Input id="username" autoComplete="off" placeholder="********" />
                        <FieldDescription>Use a strong password.</FieldDescription>
                    </Field>
                </CardContent>
                <Button className="mx-4">Login</Button>
                <CardFooter>
                    <p>All rights reserved 2026. © Fitify</p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login