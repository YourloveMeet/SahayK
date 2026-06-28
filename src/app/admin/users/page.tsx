'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserCircle, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<'all' | 'seeker' | 'donor' | 'volunteer'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', filter],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') {
        query = query.eq('role', filter)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  // Delete user permanently via RPC
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })

  // Filter based on search query
  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.phone?.includes(searchQuery)
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white">Manage Users</h1>
          <p className="text-zinc-500 font-medium">View workflows and manage platform access.</p>
        </div>
        <div className="flex bg-[#111] border border-zinc-800 rounded-xl overflow-hidden p-1">
          {['all', 'seeker', 'donor', 'volunteer'].map(role => (
            <button 
              key={role}
              onClick={() => setFilter(role as any)}
              className={`px-4 py-2 text-sm font-bold capitalize rounded-lg transition-colors ${filter === role ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search users by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-zinc-600"
          />
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111] text-xs font-black text-zinc-500 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-zinc-500 font-medium">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers?.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-full h-full text-zinc-500 p-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {user.full_name}
                            {user.verification_status === 'verified' && <span title="Verified"><ShieldCheck className="w-4 h-4 text-emerald-500" /></span>}
                          </p>
                          <p className="text-xs text-zinc-500">{user.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.is_active === false ? (
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Suspended</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500">Active</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete ${user.full_name}? This action cannot be undone.`)) {
                            deleteMutation.mutate({ id: user.id })
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-red-900/30 text-red-400 hover:bg-red-900/50"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 rounded-lg transition-colors gap-1"
                      >
                        View Workflow <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
