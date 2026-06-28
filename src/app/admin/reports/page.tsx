'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, Briefcase, Wallet, HeartHandshake, Map, CheckCircle, TrendingUp } from 'lucide-react'

export default function AdminReportsPage() {
  const supabase = createClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      // 1. Get Users Breakdown
      const { data: usersData, error: usersError } = await supabase.from('profiles').select('role')
      if (usersError) throw usersError
      
      const roles = { seeker: 0, volunteer: 0, donor: 0, ngo: 0 }
      usersData.forEach(u => {
        if (roles[u.role as keyof typeof roles] !== undefined) {
          roles[u.role as keyof typeof roles]++
        }
      })

      // 2. Get Tasks Breakdown
      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('status')
      if (tasksError) throw tasksError
      
      const taskStats = { total: tasksData.length, completed: 0, open: 0, active: 0 }
      tasksData.forEach(t => {
        if (t.status === 'completed') taskStats.completed++
        else if (t.status === 'open') taskStats.open++
        else taskStats.active++
      })

      // 3. Get Donations Total
      const { data: donationsData, error: donationsError } = await supabase.from('donations').select('amount')
      if (donationsError) throw donationsError
      const totalDonations = donationsData.reduce((sum, d) => sum + (d.amount || 0), 0)

      return {
        totalUsers: usersData.length,
        roles,
        taskStats,
        totalDonations
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white">Reports & Analytics</h1>
          <p className="text-zinc-500 font-medium mt-1">Platform overview and high-level statistics.</p>
        </div>
        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 border border-zinc-700">
          <TrendingUp className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Total Users</h3>
            <div className="w-10 h-10 bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{stats?.totalUsers}</p>
        </div>

        {/* Total Tasks */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Total Requests</h3>
            <div className="w-10 h-10 bg-emerald-900/20 text-emerald-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{stats?.taskStats.total}</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Completed</h3>
            <div className="w-10 h-10 bg-purple-900/20 text-purple-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{stats?.taskStats.completed}</p>
        </div>

        {/* Total Donations */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Donations</h3>
            <div className="w-10 h-10 bg-pink-900/20 text-pink-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">₹{stats?.totalDonations.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Breakdown */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-500" /> User Demographics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-white font-bold">Seekers</p>
                  <p className="text-zinc-500 text-xs">People requesting help</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.roles.seeker}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                <div>
                  <p className="text-white font-bold">Volunteers</p>
                  <p className="text-zinc-500 text-xs">People offering help</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.roles.volunteer}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-pink-500 rounded-full"></div>
                <div>
                  <p className="text-white font-bold">Donors</p>
                  <p className="text-zinc-500 text-xs">Financial supporters</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.roles.donor}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="text-white font-bold">NGOs</p>
                  <p className="text-zinc-500 text-xs">Partner organizations</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.roles.ngo}</p>
            </div>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-zinc-500" /> Request Status
          </h3>
          <div className="flex flex-col h-full justify-start gap-4">
             <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold">Open Requests</p>
                  <p className="text-zinc-500 text-xs">Waiting for volunteers</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.taskStats.open}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold">Active / In Progress</p>
                  <p className="text-zinc-500 text-xs">Currently being handled</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.taskStats.active}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold">Completed</p>
                  <p className="text-zinc-500 text-xs">Successfully delivered</p>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stats?.taskStats.completed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
