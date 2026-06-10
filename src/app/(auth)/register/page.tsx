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
  role: z.enum(['seeker', 'volunteer'], {
    required_error: 'Please select a role',
  }),
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Join SahayaK today</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-lg font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-lg font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-lg font-medium">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="John Doe" 
              className="h-14 text-lg"
              {...register('fullName')} 
            />
            {errors.fullName && <p className="text-red-500 text-sm font-medium">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-medium">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              className="h-14 text-lg"
              {...register('email')} 
            />
            {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg font-medium">Password</Label>
            <Input 
              id="password" 
              type="password" 
              className="h-14 text-lg"
              {...register('password')} 
            />
            {errors.password && <p className="text-red-500 text-sm font-medium">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-lg font-medium">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              className="h-14 text-lg"
              {...register('confirmPassword')} 
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <div className="space-y-4 pt-2">
            <Label className="text-lg font-medium">I want to:</Label>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${errors.role ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-500'} has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20`}>
                <input type="radio" value="seeker" className="sr-only" {...register('role')} />
                <span className="text-lg font-bold">Get Help (Seeker)</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${errors.role ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-500'} has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20`}>
                <input type="radio" value="volunteer" className="sr-only" {...register('role')} />
                <span className="text-lg font-bold">Give Help (Volunteer)</span>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-sm font-medium">{errors.role.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-14 text-xl font-bold mt-4">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-lg text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
