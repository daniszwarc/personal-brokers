'use client'

import { Ticket, Producer } from '@/types'

interface Props {
  ticket: Ticket
  producers: Producer[]
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onAssign: (id: string, producerId: string) => void
  onArchive: (id: string) => void
}

const FUENTE_LABEL: Record<string, string> = {
  whatsapp_texto: '💬 WhatsApp',
  whatsapp_audio: '🎤 WhatsApp audio',
  mail: '✉️ Mail',
}

const TIPO_LABEL: Record<string, string> = {
  alta: 'Alta',
  baja: 'Baja',
  a_definir: 'A definir',
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function TicketModal({
  ticket, producers, onClose, onStatusChange, onAssign, onArchive
}: Props) {
  const poliza = [ticket.poliza_ramo, ticket.poliza_aseguradora, ticket.poliza_ref]
    .filter(v => v && v !== 'null').join(' · ')

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full rounded-xl shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-gray-800">{ticket.ticket_number}</span>
            <span className="text-xs text-gray-400">{TIPO_LABEL[ticket.tipo]}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cliente / poliza / resumen */}
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">
            {ticket.cliente_nombre ?? 'Cliente desconocido'}
          </div>
          {poliza && <div className="text-sm text-gray-400">{poliza}</div>}
          {ticket.resumen && <div className="text-sm text-gray-700 mt-1">{ticket.resumen}</div>}
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <div className="text-xs text-gray-400">Origen</div>
            <div className="text-gray-700">{FUENTE_LABEL[ticket.fuente]}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Asignado</div>
            {ticket.productor_id ? (
              <div className="text-gray-700">{ticket.productor_nombre}</div>
            ) : (
              <select
                className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-500"
                defaultValue=""
                onChange={e => e.target.value && onAssign(ticket.id, e.target.value)}
              >
                <option value="" disabled>Asignar...</option>
                {producers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-400">Fecha</div>
            <div className="text-gray-700">{formatFecha(ticket.created_at)}</div>
          </div>
        </div>

        {/* Mensaje */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Mensaje</div>
          <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
            {ticket.mensaje_contenido ?? 'Sin contenido'}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2">
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            value={ticket.status}
            onChange={e => onStatusChange(ticket.id, e.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <button
            onClick={() => { onStatusChange(ticket.id, 'cerrado'); onArchive(ticket.id) }}
            className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Cerrar y archivar
          </button>
        </div>
      </div>
    </div>
  )
}
