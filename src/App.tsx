import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PrivateRoute from './components/PrivateRoute'
import SidebarLayout from './components/SidebarLayout'
import Workouts from './pages/Workouts'
import Calendar from './pages/Calendar'
import History from './pages/History'
import Progress from './pages/Progress'
import Configurations from './pages/Configurations'
import PublicRoute from './components/PublicRoute'

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<Login />} path='/login' />
        <Route element={<Register />} path='/register' />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<SidebarLayout />}>
          <Route index element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/configurations" element={<Configurations />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App