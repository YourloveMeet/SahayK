import Link from 'next/link'

import { SeekerSidebar } from '@/components/seeker/SeekerSidebar'

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
        <SeekerSidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  )
}
