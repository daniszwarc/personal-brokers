'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ticket, Producer, TicketStatus } from '@/types'
import Column from './Column'
import TicketModal from './TicketModal'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'pendiente',   label: 'Pendiente' },
  { status: 'en_proceso',  label: 'En proceso' },
  { status: 'cerrado',     label: 'Cerrado' },
]

export default function Board() {
  const [tickets, setTickets]     = useState<Ticket[]>([])
  const [producers, setProducers] = useState<Producer[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [currentProducerId, setCurrentProducerId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todos' | 'mios'>('todos')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const fetchTickets = useCallback(async () => {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
    fetch('/api/producers').then(r => r.json()).then(setProducers)
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setCurrentProducerId(data.producerId)
    })
    // Refresco cada 30 segundos
    const interval = setInterval(fetchTickets, 30_000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  const visibleTickets = filter === 'mios' && currentProducerId
    ? tickets.filter(t => t.productor_id === currentProducerId || t.productor_id == null)
    : tickets

  const handleStatusChange = async (id: string, status: string) => {
    const ticket = tickets.find(t => t.id === id)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: status as TicketStatus } : t))
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    showToast(`${ticket?.ticket_number} movido a ${status.replace('_', ' ')}`)
  }

  const handleAssign = async (id: string, producerId: string) => {
    const producer = producers.find(p => p.id === producerId)
    setTickets(prev => prev.map(t =>
      t.id === id
        ? { ...t, assigned_to: producerId, productor_id: producerId, productor_nombre: producer?.name ?? null, status: 'pendiente' }
        : t
    ))
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_to: producerId, status: 'pendiente' }),
    })
    showToast(`Asignado a ${producer?.name}`)
  }

  const handleConfirm = async (id: string, accion: 'nueva' | 'fusionar') => {
    const ticket = tickets.find(t => t.id === id)
    if (accion === 'nueva') {
      handleStatusChange(id, 'pendiente')
    } else {
      setTickets(prev => prev.filter(t => t.id !== id))
      await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'fusionar', ref_ticket_id: ticket?.ref_ticket_id }),
      })
      showToast(`Mensaje incorporado a ${ticket?.ref_ticket_number}`)
    }
  }

  const handleArchive = async (id: string) => {
    const ticket = tickets.find(t => t.id === id)
    setTickets(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: false }),
    })
    showToast(`${ticket?.ticket_number} archivado`)
  }

  const handleDelete = async (id: string) => {
    const ticket = tickets.find(t => t.id === id)
    setTickets(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
    showToast(`${ticket?.ticket_number} eliminado`)
  }

  const handleDeleteClosed = async () => {
    if (!confirm('¿Eliminar todos tus tickets cerrados?')) return
    await fetch('/api/tickets/closed', { method: 'DELETE' })
    showToast('Tickets cerrados eliminados')
    fetchTickets()
  }

  const handleDrop = async (targetStatus: TicketStatus) => {
    if (!draggedId) return
    const ticket = tickets.find(t => t.id === draggedId)
    if (!ticket || ticket.status === targetStatus) return
    handleStatusChange(draggedId, targetStatus)
    setDraggedId(null)
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Cargando tareas...
      </div>
    )
  }

  return (
    <div>
      {/* Filtro */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          <button
            onClick={() => setFilter('todos')}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filter === 'todos' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('mios')}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filter === 'mios' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mis tickets
          </button>
        </div>
        <button
          onClick={handleDeleteClosed}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Eliminar cerrados
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tickets={visibleTickets.filter(t => t.status === col.status)}
            producers={producers}
            draggedId={draggedId}
            onDragStart={setDraggedId}
            onDrop={handleDrop}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onConfirm={handleConfirm}
            onArchive={handleArchive}
            onOpen={setSelectedTicketId}
          />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          ✓ {toast}
        </div>
      )}

      {/* Modal */}
      {selectedTicketId && (() => {
        const selectedTicket = tickets.find(t => t.id === selectedTicketId)
        if (!selectedTicket) return null
        return (
          <TicketModal
            ticket={selectedTicket}
            producers={producers}
            onClose={() => setSelectedTicketId(null)}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onDelete={handleDelete}
          />
        )
      })()}
    </div>
  )
}
