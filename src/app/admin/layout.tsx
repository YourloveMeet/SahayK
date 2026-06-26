export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark bg-black text-zinc-50 min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-red-600/20">
            S
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SahayaK Admin</h1>
        </div>
      </header>
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        <aside className="w-64 border-r border-zinc-800/80 hidden md:block px-4 py-8 bg-black">
          <nav className="space-y-2">
            <a href="/admin/dashboard" className="block px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Dashboard</a>
            <a href="/admin/users" className="block px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Manage Users</a>
            <a href="/admin/schemes" className="block px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Schemes</a>
            <a href="/admin/reports" className="block px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Reports</a>
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-10 bg-[#050505]">
          {children}
        </main>
      </div>
    </div>
  )
}
