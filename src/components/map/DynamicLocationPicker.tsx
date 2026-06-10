'use client'

import dynamic from 'next/dynamic'

interface DynamicLocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  defaultPosition?: [number, number]
  centerPosition?: [number, number] | null
}

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-lg flex items-center justify-center border border-gray-200 dark:border-zinc-700">
      <span className="text-gray-500 font-medium">Loading map...</span>
    </div>
  )
})

export default function DynamicLocationPicker(props: DynamicLocationPickerProps) {
  return <LocationPicker {...props} />
}
