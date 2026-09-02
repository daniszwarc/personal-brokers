export type TicketStatus = 'a_confirmar' | 'pendiente' | 'en_proceso' | 'cerrado'
export type TicketTipo = 'alta' | 'baja' | 'a_definir'
export type TicketFuente = 'whatsapp_texto' | 'whatsapp_audio' | 'mail'

export interface Ticket {
  id: string
  ticket_number: string
  tipo: TicketTipo
  status: TicketStatus
  poliza_ref: string | null
  poliza_aseguradora: string | null
  poliza_ramo: string | null
  resumen: string | null
  visible: boolean
  fuente: TicketFuente
  ref_ticket_id: string | null
  ref_ticket_number: string | null
  cliente_nombre: string | null
  productor_nombre: string | null
  productor_id: string | null
  horas_sin_mover: number
  created_at: string
  updated_at: string
}

export interface Producer {
  id: string
  name: string
}
