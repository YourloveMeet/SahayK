'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createFinancialRequestAction } from '@/services/financial.service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Please provide more details about why you need this financial help'),
  amount_needed: z.number().min(100, 'Amount must be at least ₹100'),
  urgency: z.enum(['High', 'Medium', 'Low'])
})

export default function NewFinancialRequestPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      urgency: 'Medium',
    }
  })

  const onSubmit = async (data: z.infer<typeof requestSchema>) => {
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('amount_needed', data.amount_needed.toString())
    formData.append('urgency', data.urgency)

    const result = await createFinancialRequestAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/seeker/dashboard') // Redirect back to dashboard on success
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="space-y-8 backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/80 p-6 md:p-10 rounded-3xl shadow-xl border border-white/60 dark:border-white/10 relative overflow-hidden">
        
        {/* Decorative ambient blur */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="border-b border-emerald-200/50 dark:border-emerald-900/50 pb-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-300 dark:to-blue-400 tracking-tight">Request Financial Assistance</h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">Submit a request for direct financial sponsorship from verified SahayaK donors.</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-xl font-bold text-gray-800 dark:text-gray-200">1. What do you need funds for?</Label>
            <Input 
              id="title" 
              placeholder="e.g. Need help with college tuition fees" 
              className="h-14 text-lg border border-emerald-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 rounded-xl px-4 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 shadow-inner placeholder:text-gray-400"
              {...register('title')} 
            />
            {errors.title && <p className="text-red-500 text-sm font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="amount" className="text-xl font-bold text-gray-800 dark:text-gray-200">2. Required Amount (INR)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
              <Input 
                id="amount" 
                type="number"
                placeholder="5000" 
                className="h-14 text-lg border border-emerald-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 rounded-xl pl-10 pr-4 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 shadow-inner placeholder:text-gray-400"
                {...register('amount_needed', { valueAsNumber: true })} 
              />
            </div>
            {errors.amount_needed && <p className="text-red-500 text-sm font-medium">{errors.amount_needed.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="urgency" className="text-xl font-bold text-gray-800 dark:text-gray-200">3. Urgency Level</Label>
            <select 
              id="urgency"
              className="w-full h-14 px-4 text-lg rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 shadow-inner appearance-none cursor-pointer"
              {...register('urgency')}
            >
              <option value="Low">Low (Can wait a few weeks)</option>
              <option value="Medium">Medium (Needed within a week)</option>
              <option value="High">High (Needed immediately)</option>
            </select>
            {errors.urgency && <p className="text-red-500 text-sm font-medium">{errors.urgency.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-xl font-bold text-gray-800 dark:text-gray-200">4. Provide details about your situation</Label>
            <textarea 
              id="description" 
              placeholder="Explain why you need this financial support so donors can understand your situation..."
              className="w-full min-h-[160px] p-4 text-lg rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 shadow-inner disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 resize-none transition-all"
              {...register('description')} 
            />
            {errors.description && <p className="text-red-500 text-sm font-medium">{errors.description.message}</p>}
          </div>

          <div className="pt-8">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Financial Request</span>
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
