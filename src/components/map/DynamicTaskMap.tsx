'use client'

import dynamic from 'next/dynamic'

const DynamicTaskMap = dynamic(() => import('./TaskMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-xl flex items-center justify-center border border-gray-200 dark:border-zinc-700">
      <span className="text-gray-500 font-medium text-lg">Loading interactive map...</span>
    </div>
  )
})

export default DynamicTaskMap
