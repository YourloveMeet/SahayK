'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { Globe, UserCircle, Heart } from 'lucide-react'

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: '/donor/dashboard', label: 'Browse NGOs', icon: Globe },
    { href: '/donor/profile', label: 'My Profile', icon: UserCircle },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hidden md:flex flex-col">
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

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white dark:text-zinc-900" />
          </div>
          <span className="font-extrabold text-zinc-900 dark:text-white">Donor Portal</span>
        </div>
        <div className="flex items-center gap-2">
          {links.map(link => {
            const isActive = pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href} className={`p-2 rounded-lg ${isActive ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500'}`}>
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
          <div className="ml-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <LogoutButton />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full pt-16 md:pt-0 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
