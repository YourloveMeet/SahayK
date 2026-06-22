'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { LayoutDashboard, ListTodo, UserCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [showBottomNav, setShowBottomNav] = useState(false)

  useEffect(() => {
    // Delay bottom nav to appear after the loading overlay fades out
    const timer = setTimeout(() => setShowBottomNav(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const links = [
    { href: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seeker/tasks', label: 'My Requests', icon: ListTodo },
    { href: '/seeker/profile', label: 'Profile', icon: UserCircle },
  ]

  const DesktopLayout = (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Cinematic Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/seeker/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight hidden sm:block">
                SahayaK <span className="text-blue-600 dark:text-blue-400 font-bold">Seeker</span>
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
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
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

      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  )

  const MobileLayout = (
    <div className={`flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-[#0A0A0A] ${showBottomNav ? 'pb-28' : ''}`}>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-zinc-800">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/seeker/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black">
              S
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              SahayaK
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <nav className={`fixed bottom-6 left-4 right-4 z-50 bg-zinc-950/85 backdrop-blur-2xl border border-white/15 h-16 rounded-2xl px-6 flex justify-between items-center transition-all duration-700 ease-out shadow-[0_8px_30px_rgb(0,0,0,0.6)] ${showBottomNav ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        {links.map(link => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
             <Link key={link.href} href={link.href} className={`flex flex-col items-center justify-center gap-1 transition-colors w-16 ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
               <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-transparent'}`}>
                 <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
               </div>
               <span className="text-[10px] font-bold">{link.label}</span>
             </Link>
          )
        })}
      </nav>
    </div>
  )

  return isMobile ? MobileLayout : DesktopLayout
}
