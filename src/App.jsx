import { useState } from 'react'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('access_token') || ''
    const role = localStorage.getItem('user_role') || ''
    return { token, role }
  })

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    setAuth({ token: '', role: '' })
  }

  const handleLoginSuccess = (data) => {
    setAuth(data)
  }

  if (!auth.token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <DashboardPage token={auth.token} userRole={auth.role} onLogout={handleLogout} />
}

export default App
