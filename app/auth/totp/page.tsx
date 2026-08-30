'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TotpPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al verificar el código')
        return
      }
      router.push(data.redirect)
      router.refresh()
    } catch {
      setError('Error de conexión, intente nuevamente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-800">Verificación en dos pasos</div>
          <div className="text-xs text-gray-400 mt-1">
            Ingresá el código de 6 dígitos de tu app de autenticación
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-xs text-gray-500 mb-1">Código</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-lg font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    </main>
  )
}
