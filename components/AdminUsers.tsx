'use client'

import { useEffect, useState } from 'react'

interface AdminProducer {
  id: string
  name: string
  email: string
  active: boolean
}

export default function AdminUsers() {
  const [producers, setProducers] = useState<AdminProducer[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  const fetchProducers = async () => {
    const res = await fetch('/api/admin/producers')
    const data = await res.json()
    setProducers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducers()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError('Nombre y email son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'No se pudo crear el productor.')
        setSubmitting(false)
        return
      }

      setName('')
      setEmail('')
      setSubmitting(false)
      fetchProducers()
    } catch {
      setError('Error de conexión. Intentá nuevamente.')
      setSubmitting(false)
    }
  }

  const handleReset = async (id: string) => {
    setResettingId(id)
    await fetch(`/api/admin/producers/${id}/reset`, { method: 'PATCH' })
    setResettingId(null)
    fetchProducers()
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Nuevo productor</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creando...' : 'Crear productor'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Activo</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {producers.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2 text-gray-800">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500">{p.email}</td>
                  <td className="px-4 py-2 text-gray-500">{p.active ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleReset(p.id)}
                      disabled={resettingId === p.id}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {resettingId === p.id ? 'Reseteando...' : 'Resetear contraseña'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
