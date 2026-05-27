import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👗</div>
          <h1 className="text-2xl font-semibold text-stone-800">My Closet</h1>
          <p className="text-stone-500 text-sm mt-1">Your personal wardrobe app</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h2 className="font-semibold text-stone-800 mb-2">Check your email</h2>
            <p className="text-stone-500 text-sm">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-800 text-white rounded-xl py-3 font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
