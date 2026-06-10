import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-gray-900 dark:text-white">
          Welcome to SahayaK
        </h1>
        <p className="text-xl leading-8 text-gray-600 dark:text-gray-400">
          A hyperlocal volunteer-assistance platform connecting citizens in need with nearby volunteers.
          "Donate time and knowledge instead of money."
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/login" 
            className={buttonVariants({ variant: "default", size: "lg" }) + " h-14 px-8 text-lg font-bold w-full sm:w-auto"}
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className={buttonVariants({ variant: "outline", size: "lg" }) + " h-14 px-8 text-lg font-bold w-full sm:w-auto border-2"}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
