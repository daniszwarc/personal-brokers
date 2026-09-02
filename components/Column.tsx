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
  onOpen: (id: string) => void
}

const DOT_STYLE: Record<TicketStatus, string> = {
  a_confirmar: 'bg-yellow-400',
  pendiente:   'bg-green-500',
  en_proceso:  'bg-blue-500',
  cerrado:     'bg-gray-400',
}

const COLUMN_COLOR: Record<TicketStatus, 'yellow' | 'green' | 'blue' | 'gray'> = {
  a_confirmar: 'yellow',
  pendiente:   'green',
  en_proceso:  'blue',
  cerrado:     'gray',
}

export default function Column({
  status, label, tickets, producers, draggedId,
  onDragStart, onDrop, onStatusChange, onAssign, onConfirm, onArchive, onOpen
}: Props) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-3 min-h-64"
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
          <div className={`w-3 h-3 rounded-full ${DOT_STYLE[status]}`} />
          <span className="text-lg font-bold text-gray-800">{label}</span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
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
              onOpen={onOpen}
              isDragging={draggedId === t.id}
              columnColor={COLUMN_COLOR[status]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
