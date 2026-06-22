'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { Map, ListTodo, UserCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const links = [
    { href: '/volunteer/dashboard', label: 'Dashboard', icon: Map },
    { href: '/volunteer/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/volunteer/profile', label: 'Profile', icon: UserCircle },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Cinematic Navbar (Desktop Only) */}
      <header className="hidden md:flex sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/volunteer/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight hidden sm:block">
                SahayaK
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                      isActive 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="shrink-0 border-l border-gray-200 dark:border-zinc-800 pl-4 md:pl-6 ml-2 md:ml-0">
               <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg flex items-center justify-center shadow-sm font-black">
              S
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white tracking-tight">
              SahayaK
            </span>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/volunteer/profile" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <UserCircle className="w-5 h-5" />
             </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full relative pt-16 pb-24 md:pt-0 md:pb-0`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 h-20 px-4 pb-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors ${
                  isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[11px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>{link.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
