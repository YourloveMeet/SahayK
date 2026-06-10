import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-red-600">Access Denied</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          You do not have permission to view this page.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button size="lg" className="h-14 px-8 text-lg font-bold">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
