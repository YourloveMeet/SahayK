'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { Globe, UserCircle, Heart } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const links = [
    { href: '/donor/dashboard', label: 'Browse NGOs', icon: Globe },
    { href: '/donor/profile', label: 'My Profile', icon: UserCircle },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0A0A0A]">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            SahayaK <span className="text-zinc-500 dark:text-zinc-400 font-bold block text-sm">Donor Portal</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-zinc-900 dark:text-white tracking-tight">
              SahayaK
            </span>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/donor/profile" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <UserCircle className="w-5 h-5" />
             </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full relative pt-16 md:pt-0 h-screen overflow-y-auto overflow-x-hidden`}>
        <div className={`min-h-full pb-28 md:pb-0`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-6 left-4 right-4 z-50 bg-zinc-950/85 backdrop-blur-2xl border border-white/15 h-16 rounded-2xl px-6 flex items-center justify-center gap-12 shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex flex-col items-center justify-center w-24 h-full gap-1 transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>{link.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
