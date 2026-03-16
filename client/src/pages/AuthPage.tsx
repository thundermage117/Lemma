import { FormEvent, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const { authMode, setAuthMode, signInWithPassword, signUpWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isSignUp = authMode === 'sign-up'

  const modeCopy = useMemo(
    () =>
      isSignUp
        ? {
            title: 'Create your Lemma account',
            subtitle: 'Use your email and password to set up secure access.',
            primaryLabel: 'Create account',
            switchLabel: 'Already have an account?',
            switchAction: 'Sign in',
          }
        : {
            title: 'Welcome back',
            subtitle: 'Sign in to continue your study session.',
            primaryLabel: 'Sign in',
            switchLabel: "Don't have an account?",
            switchAction: 'Create one',
          },
    [isSignUp]
  )

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const result = await signUpWithPassword(email.trim(), password)

        if (result.needsEmailConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.')
        } else {
          setNotice('Account created. You are now signed in.')
        }
      } else {
        await signInWithPassword(email.trim(), password)
      }
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setError(null)
    setNotice(null)
    setAuthMode(isSignUp ? 'sign-in' : 'sign-up')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">λ</span>
            </div>
            <span className="text-slate-900 font-semibold text-lg tracking-tight">Lemma</span>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">{modeCopy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{modeCopy.subtitle}</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp ? (
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          ) : null}
          {notice ? (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {notice}
            </p>
          ) : null}

          <Button type="submit" loading={loading} className="w-full justify-center">
            {modeCopy.primaryLabel}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-500 text-center">
          {modeCopy.switchLabel}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {modeCopy.switchAction}
          </button>
        </div>
      </div>
    </div>
  )
}
