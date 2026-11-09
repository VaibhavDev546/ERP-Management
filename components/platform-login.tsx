'use client'

import { useState, type FormEvent } from 'react'
import { LockKeyhole, Sparkles } from 'lucide-react'

type Props = {
  error: string
  onLogin: (email: string, password: string) => Promise<void>
}

export function PlatformLogin({ error, onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await onLogin(email, password)
    } catch (loginError) {
      setFormError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand"><span className="brand-mark"><Sparkles size={17} /></span><strong>northstar</strong><span className="brand-badge">ADMIN</span></div>
        <div className="eyebrow">Platform access</div>
        <h1>Sign in to Super Admin</h1>
        <p>Use your platform administrator account to continue.</p>
        {(formError || error) && <div className="api-error" role="alert">{formError || error}</div>}
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <button className="primary-button login-submit" disabled={submitting}><LockKeyhole size={15} />{submitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  )
}
