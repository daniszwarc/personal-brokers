'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingQr, setLoadingQr] = useState(true)

  useEffect(() => {
    fetch('/api/auth/setup')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Error al cargar la configuración')
          return
        }
        setQrDataUrl(data.qrDataUrl)
        setSecret(data.secret)
      })
      .catch(() => setError('Error de conexión, intente nuevamente'))
      .finally(() => setLoadingQr(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al completar la configuración')
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
          <div className="text-sm font-semibold text-gray-800">Configuración inicial</div>
          <div className="text-xs text-gray-400 mt-1">
            Definí tu contraseña y escaneá el código QR con tu app de autenticación
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg py-4 mb-4">
          {loadingQr ? (
            <div className="text-xs text-gray-400">Cargando código QR...</div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="Código QR de autenticación" className="w-40 h-40" />
          ) : (
            <div className="text-xs text-red-500">No se pudo generar el código QR</div>
          )}
        </div>

        {secret && (
          <div className="text-[11px] text-gray-400 text-center mb-4 break-all">
            Clave manual: {secret}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs text-gray-500 mb-1">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-xs text-gray-500 mb-1">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repetí la contraseña"
            />
          </div>
          <div>
            <label htmlFor="code" className="block text-xs text-gray-500 mb-1">Código de verificación</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
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
            {loading ? 'Guardando...' : 'Activar cuenta'}
          </button>
        </form>
      </div>
    </main>
  )
}
