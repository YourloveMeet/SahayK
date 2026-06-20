'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { LayoutDashboard, Users, UserCircle, Wallet, BriefcaseMedical, Globe, SendHorizonal, Inbox, HeartHandshake } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { AlarmManager } from '@/components/AlarmManager'

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

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

  const supabase = createClient()
  const router = useRouter()

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isSetup = pathname === '/ngo/setup'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A]">
      {/* Sidebar */}
      {!isSetup && (
      <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-zinc-900/10">
            N
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            SahayaK <span className="text-zinc-500 dark:text-zinc-400 font-bold block text-sm">NGO Admin</span>
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

      {/* Mobile Nav */}
      {!isSetup && (
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black">N</div>
          <span className="font-extrabold text-gray-900 dark:text-white">NGO Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`p-2 rounded-lg ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
          <div className="ml-2 pl-2 border-l border-gray-200 dark:border-zinc-800">
             <LogoutButton />
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full relative ${isSetup ? '' : 'pt-16 md:pt-0'} h-screen overflow-y-auto`}>
        {children}
      </main>

      {/* Global NGO Alarm Manager */}
      {!isSetup && <AlarmManager />}
    </div>
  )
}
