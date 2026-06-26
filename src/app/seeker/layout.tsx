'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { LayoutDashboard, ListTodo, UserCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ShinyText } from '@/components/ui/ShinyText'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
          <Link href="/seeker/dashboard" className="flex items-center justify-center h-full notranslate">
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
          
          <div className="px-4 py-2.5 bg-[#b6e8cc] text-[#111111] rounded-[14px] font-black text-xs tracking-widest shadow-sm select-none notranslate">
            SKR
          </div>
          <div 
            onClick={() => {
              // Quick and dirty logout redirect since we can't easily import logoutAction here without making it async or handling forms
              // The LogoutButton is imported, we could render it invisibly and click it, but a cleaner way is just wrapping it
            }}
            className="w-10 h-10 bg-[#4a4655] hover:bg-[#5a5568] rounded-[14px] flex items-center justify-center transition-colors cursor-pointer text-white shadow-sm relative overflow-hidden"
          >
            {/* We can just render the LogoutButton absolute and invisible to hijack its functionality, or just use it directly if we override styles */}
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
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight notranslate">
              SahayaK
            </span>
          </Link>
          <LanguageSwitcher />
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
