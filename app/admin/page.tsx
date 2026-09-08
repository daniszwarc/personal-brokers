import { redirect } from 'next/navigation'
import { getSession, ADMIN_PRODUCER_ID } from '@/lib/auth'
import AdminUsers from '@/components/AdminUsers'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.producerId !== ADMIN_PRODUCER_ID) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3">
        <div className="text-sm font-semibold text-gray-800">Administración de usuarios</div>
        <div className="text-xs text-gray-400">Personal Brokers</div>
      </div>

      <div className="p-3 md:p-6">
        <AdminUsers />
      </div>
    </main>
  )
}
