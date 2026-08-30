import Board from '@/components/Board'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
            🛡
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Personal Brokers</div>
            <div className="text-xs text-gray-400">Gestión de tareas</div>
          </div>
        </div>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
          + Nueva tarea
        </button>
      </div>

      {/* Board */}
      <div className="p-6">
        <Board />
      </div>
    </main>
  )
}
