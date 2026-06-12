'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loginAction } from '@/services/auth.service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await loginAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-slate-50">
      
      {/* Light Premium Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/40 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/40 blur-[150px] rounded-full pointer-events-none mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Elements */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-6">
            <span className="text-3xl font-black text-white">S</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="mt-3 text-lg text-slate-600 font-medium">Sign in to your SahayaK account</p>
        </div>

        {/* Clean Light Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/80 p-8 rounded-3xl shadow-2xl shadow-emerald-900/5">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  className="relative h-14 text-lg bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-sm"
                  {...register('email')} 
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</Label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="relative h-14 text-lg tracking-widest bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-sm"
                  {...register('password')} 
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="relative w-full h-14 text-lg font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl overflow-hidden shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </>
                ) : (
                  <>Sign In <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                )}
              </span>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <a href="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Create one now
              </a>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs font-medium text-slate-400 mt-12">
          &copy; {new Date().getFullYear()} SahayaK Platform. All rights reserved.
        </p>
      </div>
    </div>
  )
}
