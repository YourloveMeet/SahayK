'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { Map, ListTodo, UserCircle } from 'lucide-react'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const links = [
    { href: '/volunteer/dashboard', label: 'Dashboard', icon: Map },
    { href: '/volunteer/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/volunteer/profile', label: 'Profile', icon: UserCircle },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Cinematic Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
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
            {/* Mobile Nav Icons */}
            <div className="flex md:hidden items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                )
              })}
            </div>

            <div className="shrink-0 border-l border-gray-200 dark:border-zinc-800 pl-4 md:pl-6 ml-2 md:ml-0">
               <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
