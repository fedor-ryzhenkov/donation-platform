import { useState } from 'react'

type Props = {
  title: string
  subtitle?: string
  submitLabel?: string
  onVerify: (password: string) => Promise<void>
}

export default function PasswordGate({ title, subtitle, submitLabel = 'Unlock', onVerify }: Props) {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onVerify(password)
    } catch {
      setError('Invalid password')
      setSubmitting(false)
      return
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="p-6 border-b border-surface-200">
          <h1 className="text-xl font-semibold text-surface-950 font-display">{title}</h1>
          {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-surface-200 flex justify-end gap-3">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Checking...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


