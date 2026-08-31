'use client'

import { useEffect, useRef, useState } from 'react'
import { Producer } from '@/types'

interface NewTicketModalProps {
  producers: Producer[]
  onClose: () => void
  onCreated: () => void
}

const TIPOS = [
  { value: 'alta', label: 'Alta' },
  { value: 'baja', label: 'Baja' },
  { value: 'a_definir', label: 'A definir' },
]

export default function NewTicketModal({ producers, onClose, onCreated }: NewTicketModalProps) {
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState('')
  const [poliza, setPoliza] = useState('')
  const [aseguradora, setAseguradora] = useState('')
  const [ramo, setRamo] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!cliente.trim()) {
      setError('El campo Cliente es obligatorio.')
      return
    }
    if (!tipo) {
      setError('El campo Tipo es obligatorio.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: cliente.trim(),
          tipo,
          poliza_ref: poliza.trim() || null,
          poliza_aseguradora: aseguradora.trim() || null,
          poliza_ramo: ramo.trim() || null,
          assigned_to: assignedTo || null,
          fuente: 'manual',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'No se pudo crear la tarea. Intentá nuevamente.')
        setSubmitting(false)
        return
      }

      onCreated()
    } catch {
      setError('Error de conexión. Intentá nuevamente.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Nueva tarea</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 md:px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccionar...</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Póliza</label>
              <input
                type="text"
                value={poliza}
                onChange={e => setPoliza(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Aseguradora</label>
              <input
                type="text"
                value={aseguradora}
                onChange={e => setAseguradora(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ramo</label>
            <input
              type="text"
              value={ramo}
              onChange={e => setRamo(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Asignar a</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Sin asignar</option>
              {producers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
