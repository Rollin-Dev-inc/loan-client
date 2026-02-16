import { useState } from 'react'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken('')
  }

  if (!token) {
    return <LoginPage onLoginSuccess={setToken} />
  }

  return <DashboardPage token={token} onLogout={handleLogout} />
}

export default App
