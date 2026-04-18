import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const Home = () => {
    const { logout } = useAuth()
    return (
        <Button onClick={() => logout()} variant="destructive">
            Logout
        </Button>
    )
}

export default Home