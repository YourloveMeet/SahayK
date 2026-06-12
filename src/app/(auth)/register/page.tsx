'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signupAction } from '@/services/auth.service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['seeker', 'volunteer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('fullName', data.fullName)
    formData.append('role', data.role)

    const result = await signupAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccess(result.success)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-slate-50 py-12">
      
      {/* Light Premium Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/40 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/40 blur-[150px] rounded-full pointer-events-none mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        
        {/* Brand Elements */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-6">
            <span className="text-3xl font-black text-white">S</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="mt-3 text-lg text-slate-600 font-medium">Join the SahayaK platform today</p>
        </div>

        {/* Clean Light Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/80 p-8 rounded-3xl shadow-2xl shadow-emerald-900/5">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  className="relative h-14 text-lg bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-sm"
                  {...register('fullName')} 
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.fullName.message}</p>}
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Confirm</Label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••"
                    className="relative h-14 text-lg tracking-widest bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-sm"
                    {...register('confirmPassword')} 
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Choose your role</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Seeker Card */}
                <label className="relative group cursor-pointer">
                  <input type="radio" value="seeker" className="peer sr-only" {...register('role')} />
                  <div className="absolute inset-0 bg-emerald-50 border-2 border-emerald-500 rounded-2xl opacity-0 peer-checked:opacity-100 transition duration-300 shadow-inner"></div>
                  <div className="relative flex items-center p-4 h-full bg-white/80 border border-slate-200 rounded-2xl peer-checked:bg-transparent peer-checked:border-transparent transition-all hover:bg-white">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mr-4 border border-slate-200 peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors">
                      <svg className="w-6 h-6 text-slate-400 peer-checked:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-lg peer-checked:text-emerald-900">Seeker</h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5 peer-checked:text-emerald-700">I need help with services</p>
                    </div>
                  </div>
                </label>

                {/* Volunteer Card */}
                <label className="relative group cursor-pointer">
                  <input type="radio" value="volunteer" className="peer sr-only" {...register('role')} />
                  <div className="absolute inset-0 bg-teal-50 border-2 border-teal-500 rounded-2xl opacity-0 peer-checked:opacity-100 transition duration-300 shadow-inner"></div>
                  <div className="relative flex items-center p-4 h-full bg-white/80 border border-slate-200 rounded-2xl peer-checked:bg-transparent peer-checked:border-transparent transition-all hover:bg-white">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mr-4 border border-slate-200 peer-checked:bg-teal-500 peer-checked:border-teal-400 transition-colors">
                      <svg className="w-6 h-6 text-slate-400 peer-checked:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-lg peer-checked:text-teal-900">Volunteer</h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5 peer-checked:text-teal-700">I want to help others</p>
                    </div>
                  </div>
                </label>

              </div>
              {errors.role && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.role.message}</p>}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="relative w-full h-14 text-lg font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl overflow-hidden shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-300 group mt-8"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating Account...
                  </>
                ) : (
                  <>Create Account <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                )}
              </span>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign In
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
