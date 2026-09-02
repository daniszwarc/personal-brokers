'use client'

import { Ticket, Producer } from '@/types'

interface Props {
  ticket: Ticket
  producers: Producer[]
  onStatusChange: (id: string, status: string) => void
  onAssign: (id: string, producerId: string) => void
  onConfirm: (id: string, accion: 'nueva' | 'fusionar') => void
  isDragging?: boolean
}

const FUENTE_LABEL: Record<string, string> = {
  whatsapp_texto: '💬 WhatsApp',
  whatsapp_audio: '🎤 WhatsApp audio',
  mail: '✉️ Mail',
}

const TIPO_STYLE: Record<string, string> = {
  alta:     'bg-green-100 text-green-700',
  baja:     'bg-red-100 text-red-700',
  a_definir:'bg-yellow-100 text-yellow-700',
}

const TIPO_LABEL: Record<string, string> = {
  alta: 'Alta',
  baja: 'Baja',
  a_definir: 'A definir',
}

export default function TicketCard({
  ticket, producers, onStatusChange, onAssign, onConfirm, isDragging
}: Props) {
  const demora = ticket.horas_sin_mover > 4 && ticket.status !== 'cerrado'
  const sinAsignar = !ticket.productor_id

  return (
    <div
      draggable={ticket.status !== 'a_confirmar'}
      className={`
        relative bg-white rounded-xl border p-3 mb-2 cursor-grab select-none
        ${demora ? 'border-l-2 border-l-red-400 border-r border-t border-b border-gray-200' : 'border-gray-200'}
        ${isDragging ? 'opacity-40' : ''}
        hover:border-gray-300 transition-colors
      `}
    >
      {ticket.has_new_message && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-gray-400">{ticket.ticket_number}</span>
        <span className="text-xs text-gray-400">{FUENTE_LABEL[ticket.fuente]}</span>
      </div>

      {/* Tipo */}
      <div className="mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_STYLE[ticket.tipo]}`}>
          {TIPO_LABEL[ticket.tipo]}
        </span>
      </div>

      {/* Cliente */}
      <div className="text-sm font-medium text-gray-800 mb-0.5">
        {ticket.cliente_nombre ?? 'Cliente desconocido'}
      </div>

      {/* Póliza */}
      {(ticket.poliza_ramo || ticket.poliza_aseguradora || ticket.poliza_ref) && (
        <div className="text-xs text-gray-500 mb-2">
          {[ticket.poliza_ramo, ticket.poliza_aseguradora, ticket.poliza_ref]
            .filter(Boolean).join(' · ')}
        </div>
      )}

      {/* Banner A confirmar — sin productor */}
      {ticket.status === 'a_confirmar' && sinAsignar && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-amber-700 font-medium mb-1.5">⚠️ Sin productor asignado</p>
          <select
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 mb-1.5 bg-white"
            defaultValue=""
            onChange={e => e.target.value && onAssign(ticket.id, e.target.value)}
          >
            <option value="" disabled>Asignar a...</option>
            {producers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => onStatusChange(ticket.id, 'cerrado')}
            className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Banner A confirmar — posible duplicado */}
      {ticket.status === 'a_confirmar' && ticket.ref_ticket_number && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-amber-700 font-medium mb-1.5">
            ¿Tarea nueva o actualización de {ticket.ref_ticket_number}?
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onConfirm(ticket.id, 'nueva')}
              className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 transition-colors"
            >
              Tarea nueva
            </button>
            <button
              onClick={() => onConfirm(ticket.id, 'fusionar')}
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
            >
              Actualizar {ticket.ref_ticket_number}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {ticket.productor_nombre ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-medium">
                {ticket.productor_nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-xs text-gray-500">
                {ticket.productor_nombre.split(' ')[0]}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">Sin asignar</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {ticket.status === 'cerrado' ? '✓' : '⏱'}
          {demora
            ? <span className="text-red-500">hace {Math.round(ticket.horas_sin_mover)} hs</span>
            : <span>hace {Math.round(ticket.horas_sin_mover)} hs</span>
          }
        </div>
      </div>
    </div>
  )
}
