export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background px-6 py-4">
        {/* Header content: Logo, Admin profile */}
        <h1 className="text-2xl font-bold text-red-600">SahayaK Admin</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r hidden md:block px-4 py-6">
          {/* Sidebar navigation */}
          <nav className="space-y-2">
            <a href="/admin/dashboard" className="block p-2 hover:bg-accent rounded-md">Dashboard</a>
            <a href="/admin/users" className="block p-2 hover:bg-accent rounded-md">Manage Users</a>
            <a href="/admin/schemes" className="block p-2 hover:bg-accent rounded-md">Schemes</a>
            <a href="/admin/reports" className="block p-2 hover:bg-accent rounded-md">Reports</a>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
