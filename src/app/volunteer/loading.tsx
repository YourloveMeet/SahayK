import React from 'react'
import { DominosLoader } from '@/components/ui/Loaders'

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <DominosLoader />
    </div>
  )
}
