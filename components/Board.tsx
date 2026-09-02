'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ticket, Producer, TicketStatus } from '@/types'
import Column from './Column'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'a_confirmar', label: 'A confirmar' },
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
    // Refresco cada 30 segundos
    const interval = setInterval(fetchTickets, 30_000)
    return () => clearInterval(interval)
  }, [fetchTickets])

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

  const handleDrop = async (targetStatus: TicketStatus) => {
    if (!draggedId) return
    const ticket = tickets.find(t => t.id === draggedId)
    if (!ticket || ticket.status === targetStatus) return
    handleStatusChange(draggedId, targetStatus)
    setDraggedId(null)
  }

  // Stats
  const stats = {
    a_confirmar: tickets.filter(t => t.status === 'a_confirmar').length,
    pendiente:   tickets.filter(t => t.status === 'pendiente').length,
    en_proceso:  tickets.filter(t => t.status === 'en_proceso').length,
    cerrado:     tickets.filter(t => t.status === 'cerrado').length,
    demorasPendiente:  tickets.filter(t => t.status === 'pendiente'  && t.horas_sin_mover > 4).length,
    demorasEnProceso:  tickets.filter(t => t.status === 'en_proceso' && t.horas_sin_mover > 4).length,
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'A confirmar', val: stats.a_confirmar, sub: stats.a_confirmar > 0 ? `${stats.a_confirmar} requieren atención` : '', warn: true },
          { label: 'Pendientes',  val: stats.pendiente,   sub: stats.demorasPendiente > 0 ? `${stats.demorasPendiente} con demora` : 'Sin demoras', warn: stats.demorasPendiente > 0 },
          { label: 'En proceso',  val: stats.en_proceso,  sub: stats.demorasEnProceso > 0 ? `${stats.demorasEnProceso} con demora` : 'Sin demoras', warn: stats.demorasEnProceso > 0 },
          { label: 'Cerradas hoy',val: stats.cerrado,     sub: 'Promedio: 2.4 hs', warn: false },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-semibold text-gray-800">{s.val}</div>
            {s.sub && (
              <div className={`text-xs mt-1 ${s.warn ? 'text-amber-500' : 'text-green-500'}`}>
                {s.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tickets={tickets.filter(t => t.status === col.status)}
            producers={producers}
            draggedId={draggedId}
            onDragStart={setDraggedId}
            onDrop={handleDrop}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onConfirm={handleConfirm}
            onArchive={handleArchive}
          />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
