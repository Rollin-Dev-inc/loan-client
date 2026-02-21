import { useState } from 'react'

import AuthCard from '../components/AuthCard'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { fetchProfile, loginRequest } from '../services/auth'

function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const result = await loginRequest(form)
      const token = result.access_token
      localStorage.setItem('access_token', token)

      const profile = await fetchProfile(token)
      localStorage.setItem('user_role', profile.role)

      setSuccessMessage('Login berhasil')
      if (onLoginSuccess) {
        onLoginSuccess({ token, role: profile.role })
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-zinc-50 to-amber-50 p-4 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        <AuthCard
          title="Login Rental Mobil"
          subtitle="Masuk untuk mengelola kategori, item, pinjaman, dan dashboard."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextInput
              id="username"
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              autoComplete="username"
              required
            />

            <TextInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />

            {errorMessage ? (
              <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <Button type="submit" isLoading={isSubmitting}>
              Masuk
            </Button>
          </form>
        </AuthCard>
      </div>
    </main>
  )
}

export default LoginPage
