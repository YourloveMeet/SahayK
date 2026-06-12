'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loginAction } from '@/services/auth.service'
import { motion } from 'framer-motion'
import { ShinyText } from '@/components/ui/ShinyText'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-white text-gray-900 font-sans py-12">
      
      {/* Background Gradients (Multiply blend mode for white background, matching home page) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_80%)] pointer-events-none z-0" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
        </Link>
        
        {/* Brand Elements */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
            <ShinyText 
              text="Welcome Back" 
              className="text-gray-900"
              speed={4.5}
            />
          </h1>
          <p className="text-lg text-gray-500 font-medium">Sign in to your SahayaK account.</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              className="h-14 text-lg bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-none px-1 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors shadow-none"
              {...register('email')} 
            />
            {errors.email && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.email.message}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</Label>
              <a href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Forgot?</a>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              className="h-14 text-lg tracking-widest bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-none px-1 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors shadow-none"
              {...register('password')} 
            />
            {errors.password && <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.password.message}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-8">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="group relative w-full h-16 text-lg font-bold text-white rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl"
            >
              {/* Animated Dark/Silver Background exactly like home page */}
              <motion.div 
                className="absolute inset-0 bg-[linear-gradient(110deg,#111827,48%,#4b5563,52%,#111827)] bg-[length:250%_100%] z-0"
                initial={{ backgroundPosition: "100% 50%" }}
                animate={{ backgroundPosition: "0% 50%" }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </>
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </Button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-10 text-center">
          <p className="text-sm font-medium text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-gray-900 hover:underline underline-offset-4 transition-all">
              Create one now
            </Link>
          </p>
        </motion.div>
        
      </motion.div>
    </div>
  )
}
