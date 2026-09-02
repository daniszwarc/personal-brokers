'use client'

import { Ticket, Producer, TicketStatus } from '@/types'
import TicketCard from './TicketCard'

interface Props {
  status: TicketStatus
  label: string
  tickets: Ticket[]
  producers: Producer[]
  draggedId: string | null
  onDragStart: (id: string) => void
  onDrop: (status: TicketStatus) => void
  onStatusChange: (id: string, status: string) => void
  onAssign: (id: string, producerId: string) => void
  onConfirm: (id: string, accion: 'nueva' | 'fusionar') => void
  onArchive: (id: string) => void
}

const COL_STYLE: Record<TicketStatus, string> = {
  a_confirmar: 'bg-amber-50',
  pendiente:   'bg-gray-50',
  en_proceso:  'bg-blue-50',
  cerrado:     'bg-green-50',
}

const DOT_STYLE: Record<TicketStatus, string> = {
  a_confirmar: 'bg-amber-400',
  pendiente:   'bg-gray-400',
  en_proceso:  'bg-blue-500',
  cerrado:     'bg-green-500',
}

const BADGE_STYLE: Record<TicketStatus, string> = {
  a_confirmar: 'bg-amber-400 text-white',
  pendiente:   'bg-gray-300 text-gray-700',
  en_proceso:  'bg-blue-100 text-blue-700',
  cerrado:     'bg-green-100 text-green-700',
}

export default function Column({
  status, label, tickets, producers, draggedId,
  onDragStart, onDrop, onStatusChange, onAssign, onConfirm, onArchive
}: Props) {
  return (
    <div
      className={`rounded-xl p-3 min-h-64 ${COL_STYLE[status]}`}
      onDragOver={e => {
        if (status !== 'a_confirmar') e.preventDefault()
      }}
      onDrop={() => {
        if (status !== 'a_confirmar') onDrop(status)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${DOT_STYLE[status]}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_STYLE[status]}`}>
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div>
        {tickets.map(t => (
          <div
            key={t.id}
            draggable={status !== 'a_confirmar'}
            onDragStart={() => onDragStart(t.id)}
          >
            <TicketCard
              ticket={t}
              producers={producers}
              onStatusChange={onStatusChange}
              onAssign={onAssign}
              onConfirm={onConfirm}
              onArchive={onArchive}
              isDragging={draggedId === t.id}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
