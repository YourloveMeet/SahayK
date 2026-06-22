'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { LayoutDashboard, Users, UserCircle, Wallet, BriefcaseMedical, Globe, SendHorizonal, Inbox, HeartHandshake, Menu, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { AlarmManager } from '@/components/AlarmManager'
import { useIsMobile } from '@/hooks/use-mobile'

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const links = [
    { href: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ngo/residents', label: 'Residents', icon: Users },
    { href: '/ngo/caretakers', label: 'Caretakers', icon: BriefcaseMedical },
    { href: '/ngo/expenses', label: 'Expenses', icon: Wallet },
    { href: '/ngo/network', label: 'Network', icon: Globe },
    { href: '/ngo/referrals', label: 'Referrals', icon: SendHorizonal },
    { href: '/ngo/inquiries', label: 'Inquiries', icon: Inbox },
    { href: '/ngo/needs', label: 'Needs Board', icon: HeartHandshake },
    { href: '/ngo/profile', label: 'Profile', icon: UserCircle },
  ]

  const coreMobileLinks = [
    { href: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ngo/residents', label: 'Residents', icon: Users },
    { href: '/ngo/caretakers', label: 'Caretakers', icon: BriefcaseMedical },
  ]

  const supabase = createClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['ngo_profile_status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('profile_complete')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  })

  // Handle redirects based on profile completion
  React.useEffect(() => {
    if (!isLoading && profile !== undefined) {
      if (!profile?.profile_complete && pathname !== '/ngo/setup') {
        router.push('/ngo/setup')
      } else if (profile?.profile_complete && pathname === '/ngo/setup') {
        router.push('/ngo/dashboard')
      }
    }
  }, [profile, isLoading, pathname, router])

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isSetup = pathname === '/ngo/setup'

  return (
    <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Desktop Sidebar */}
      {!isSetup && (
        <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hidden md:flex flex-col z-10">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-zinc-900/10">
              N
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              SahayaK <span className="text-zinc-500 dark:text-zinc-400 font-bold block text-sm">NGO Admin</span>
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href)
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md shadow-zinc-900/10' 
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
            <LogoutButton />
          </div>
        </aside>
      )}

      {/* Mobile Top Bar */}
      {!isSetup && isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black text-base shadow-sm">
              N
            </div>
            <span className="font-extrabold text-zinc-900 dark:text-white tracking-tight">
              SahayaK
            </span>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/ngo/profile" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <UserCircle className="w-5 h-5" />
             </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full relative ${isSetup ? '' : 'pt-16 md:pt-0'} h-[100dvh] overflow-y-auto overflow-x-hidden`}>
        <div className={`min-h-full ${isSetup ? '' : 'pb-28 md:pb-0'}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isSetup && isMobile && (
        <>
          <div className="fixed bottom-6 left-4 right-4 z-50 bg-zinc-950 border border-zinc-800 h-16 rounded-2xl px-6 flex items-center justify-around shadow-2xl shadow-black/40">
            {coreMobileLinks.map((link) => {
              const isActive = pathname.startsWith(link.href)
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-zinc-800' : 'bg-transparent'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  </div>
                  <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>{link.label}</span>
                </Link>
              )
            })}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                isMobileMenuOpen ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isMobileMenuOpen ? 'bg-zinc-800' : 'bg-transparent'}`}>
                <Menu className={`w-5 h-5 ${isMobileMenuOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-bold ${isMobileMenuOpen ? 'opacity-100' : 'opacity-80'}`}>More</span>
            </button>
          </div>

          {/* Mobile "More" Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[60] bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 flex items-end sm:items-center justify-center">
              <div 
                className="bg-white dark:bg-zinc-950 w-full sm:w-[400px] h-[80vh] sm:h-auto sm:max-h-[80vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300"
              >
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">Menu</h2>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {links.map((link) => {
                    const isActive = pathname.startsWith(link.href)
                    const Icon = link.icon
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                          isActive 
                            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white' 
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <LogoutButton />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Global NGO Alarm Manager */}
      {!isSetup && <AlarmManager />}
    </div>
  )
}
