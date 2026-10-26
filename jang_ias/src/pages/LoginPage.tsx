import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('admin@ambercafe.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const from = (loc.state as { from?: string } | null)?.from || '/operations'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      nav(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Amber Cafe</p>
        <h1 className="mt-2 text-3xl text-primary">Administrator sign-in</h1>
        <p className="mt-2 text-sm text-muted">
          Guest Wi-Fi users should open the <Link to="/guest" className="text-amber">guest portal</Link>, not this page.
        </p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-subtle bg-surface p-5">
        <label className="block text-sm">
          <span className="text-muted">Email</span>
          <input className="mt-1 w-full rounded-md border border-subtle bg-base px-3 py-2 text-primary" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Password</span>
          <input className="mt-1 w-full rounded-md border border-subtle bg-base px-3 py-2 text-primary" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <p className="text-sm text-fail">{error}</p>}
        <button type="submit" className="w-full rounded-md bg-amber px-4 py-2 text-sm font-semibold text-base">
          Sign in
        </button>
      </form>
    </div>
  )
}
