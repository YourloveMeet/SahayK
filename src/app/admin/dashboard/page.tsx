import { LogoutButton } from '@/components/LogoutButton'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow border dark:border-zinc-800">
        <p className="text-lg">Welcome to the Admin Dashboard. Here you can manage users, schemes, and platform reports.</p>
      </div>
    </div>
  )
}
