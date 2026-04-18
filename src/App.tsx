import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'

const App = () => {
  return (
    <Routes>
      <Route element={<Login />} path='/login' />
      <Route element={<Register />} path='/register' />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Home />} index />
      </Route>
    </Routes>
  )
}

export default App