import Board from '@/components/Board'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Personal Brokers" className="h-8 w-auto" />
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
      <div className="p-3 md:p-6">
        <Board />
      </div>
    </main>
  )
}
