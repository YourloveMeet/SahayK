import Link from 'next/link'

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/20">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">SahayaK <span className="text-emerald-600 dark:text-emerald-400">Seeker</span></h1>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 dark:border-zinc-800 hidden md:flex flex-col px-6 py-8 bg-white/30 dark:bg-zinc-900/10">
          <nav className="space-y-4">
            <Link href="/seeker/dashboard" className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl transition-all border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/seeker/tasks" className="flex items-center gap-4 p-4 hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-semibold rounded-2xl transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              My Tasks
            </Link>
            <Link href="/seeker/profile" className="flex items-center gap-4 p-4 hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-semibold rounded-2xl transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  )
}
