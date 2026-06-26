'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { Map, ListTodo, UserCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ShinyText } from '@/components/ui/ShinyText'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Floating Pill Navbar (Desktop) */}
      <header className="hidden md:flex sticky top-6 z-50 mx-auto w-[95%] max-w-5xl rounded-full bg-[#111111] shadow-2xl h-16 items-center justify-between px-2 mb-10 border border-white/5">
        
        {/* Left Links */}
        <nav className="flex items-center gap-2 pl-6 w-1/3">
          {links.slice(0, 2).map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm tracking-wide ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Center Logo */}
        <div className="flex justify-center w-1/3">
          <Link href="/volunteer/dashboard" className="flex items-center justify-center h-full notranslate">
            <ShinyText 
              text="SAHAYAK" 
              className="font-extrabold text-xl tracking-widest" 
              speed={3} 
            />
          </Link>
        </div>

        {/* Right Links & Buttons */}
        <div className="flex items-center justify-end gap-3 w-1/3 pr-2">
          <LanguageSwitcher />
          {links.slice(2).map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm tracking-wide mr-2 ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          
          <div className="px-4 py-2.5 bg-[#b39552] text-white rounded-[14px] font-black text-xs tracking-widest shadow-sm select-none notranslate">
            VOL
          </div>
          <div className="w-10 h-10 bg-[#4a4655] hover:bg-[#5a5568] rounded-[14px] flex items-center justify-center transition-colors cursor-pointer text-white shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-0">
              <LogoutButton />
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
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
            <span className="font-extrabold text-gray-900 dark:text-white tracking-tight notranslate">
              SahayaK
            </span>
          </div>
          <div className="flex items-center gap-3">
             <LanguageSwitcher />
             <Link href="/volunteer/profile" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <UserCircle className="w-5 h-5" />
             </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full relative pt-16 pb-28 md:pt-0 md:pb-0`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-6 left-4 right-4 z-50 bg-zinc-950/85 backdrop-blur-2xl border border-white/15 h-16 rounded-2xl px-6 flex items-center justify-around shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
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
