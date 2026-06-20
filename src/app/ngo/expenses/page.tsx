'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet, Plus, Receipt, TrendingDown, ArrowUpRight, DollarSign, PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function ExpensesPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Medical',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0]
  })

  // 1. Get NGO Profile ID
  const { data: ngoProfile } = useQuery({
    queryKey: ['ngoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id, ngo_name')
        .eq('user_id', user.id)
        .single()
      return data
    }
  })

  // 2. Get Expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['ngo', 'expenses', ngoProfile?.id],
    enabled: !!ngoProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_expenses')
        .select('*')
        .eq('ngo_id', ngoProfile!.id)
        .order('expense_date', { ascending: false })
      return data || []
    }
  })

  // Add Mutation
  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('ngo_expenses').insert({
        ngo_id: ngoProfile!.id,
        title: newExpense.title,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        expense_date: newExpense.expense_date,
        logged_by: user?.id
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'expenses'] })
      setIsModalOpen(false)
      setNewExpense({ title: '', category: 'Medical', amount: '', expense_date: new Date().toISOString().split('T')[0] })
    }
  })

  // Calculations for graphs
  const totalAmount = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  // Category Data for Pie Chart
  const categoryMap = expenses?.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount)
    return acc
  }, {}) || {}
  
  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }))

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8']

  // Monthly Data for Bar Chart
  const monthlyMap = expenses?.reduce((acc: any, curr) => {
    const month = new Date(curr.expense_date).toLocaleString('default', { month: 'short' })
    acc[month] = (acc[month] || 0) + Number(curr.amount)
    return acc
  }, {}) || {}
  
  const monthlyData = Object.keys(monthlyMap).map(key => ({
    name: key,
    amount: monthlyMap[key]
  }))

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 bg-zinc-50 dark:bg-[#09090b] min-h-screen text-zinc-900 dark:text-zinc-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            Expense Management
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Track and analyze facility operating costs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" /> Log Expense
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Spend</p>
              <p className="text-4xl font-black">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <DollarSign className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Transactions</p>
              <p className="text-4xl font-black">{expenses?.length || 0}</p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <Receipt className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900 dark:bg-zinc-100 border border-zinc-900 dark:border-zinc-100 rounded-2xl shadow-sm text-white dark:text-zinc-900">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Avg Transaction</p>
              <p className="text-4xl font-black">
                ₹{expenses?.length ? Math.round(totalAmount / expenses.length).toLocaleString() : 0}
              </p>
            </div>
            <div className="p-3 bg-white/10 dark:bg-black/10 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-zinc-500" /> Category Breakdown
          </h3>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400">No data available</div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {categoryData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm font-bold">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-zinc-500" /> Spend Trend
          </h3>
          <div className="h-[300px] w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#71717a' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Log Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="p-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">Date</th>
                <th className="p-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">Description</th>
                <th className="p-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">Category</th>
                <th className="p-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Loading...</td></tr>
              ) : expenses?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No expenses recorded yet.</td></tr>
              ) : (
                expenses?.map((expense) => (
                  <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 border-b border-zinc-100 dark:border-zinc-800 text-sm font-medium">
                      {new Date(expense.expense_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="font-bold">{expense.title}</p>
                    </td>
                    <td className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 border-b border-zinc-100 dark:border-zinc-800 text-right font-black">
                      ₹{Number(expense.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Log Expense</h2>
                <p className="text-sm text-zinc-500 mt-1">Record a new facility cost.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Weekly Groceries" 
                    value={newExpense.title} 
                    onChange={e => setNewExpense({...newExpense, title: e.target.value})} 
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newExpense.amount} 
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      value={newExpense.expense_date} 
                      onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})} 
                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Category</label>
                  <select 
                    value={newExpense.category} 
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white"
                  >
                    <option>Medical</option>
                    <option>Food & Nutrition</option>
                    <option>Maintenance</option>
                    <option>Salary</option>
                    <option>Utilities</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors dark:text-white">Cancel</button>
              <button 
                onClick={() => addExpenseMutation.mutate()} 
                disabled={addExpenseMutation.isPending || !newExpense.title || !newExpense.amount}
                className="flex-1 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
