import { login } from '../api/auth'
import React, { useState } from 'react'

const inputClass =
  'mt-1 block h-12 w-full border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none focus:border-stone-900'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError(null)
      setSubmitting(true)

      const tokens = await login(username, password)

      // Stored for authenticated API requests and token refresh
      localStorage.setItem('accessToken', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)

      onLogin()
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.')
      console.error('Login error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="flex min-h-full items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#F4F2EE' }}
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm border bg-white p-6"
        style={{ borderColor: '#E0DDD8' }}
      >
        <p
          className="mb-1 text-xs uppercase tracking-widest text-stone-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Production Dashboard
        </p>
        <h1
          className="mb-6 text-2xl font-semibold uppercase tracking-wide text-stone-900"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}
        >
          Sign In
        </h1>

        <label className="mb-4 block text-sm text-stone-600">
          Username
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mb-4 block text-sm text-stone-600">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-stone-900 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
