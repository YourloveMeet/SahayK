'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Database } from '@/types/database.types'
import { useEffect } from 'react'

type Task = Database['public']['Tables']['tasks']['Row'] & { profiles: { full_name: string, avatar_url: string | null } | null }

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface TaskMapProps {
  tasks: Task[]
  userLocation?: [number, number]
  onTaskSelect?: (task: Task) => void
}

function MapController({ center }: { center?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13) // Zoom level 13 when user location updates
    }
  }, [center, map])
  return null
}

export default function TaskMap({ tasks, userLocation = [19.0760, 72.8777], onTaskSelect }: TaskMapProps) {
  return (
    <div className="h-full w-full overflow-hidden z-0 relative">
      <MapContainer center={userLocation} zoom={12} scrollWheelZoom={true} className="h-full w-full z-0">
        <MapController center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {tasks.map(task => {
          if (!task.latitude || !task.longitude) return null;
          
          return (
            <Marker 
              key={task.id} 
              position={[task.latitude, task.longitude]}
              eventHandlers={{
                click: () => onTaskSelect?.(task)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-base">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.area_name || 'Unknown Area'}</p>
                  
                  {task.is_urgent && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">
                      URGENT
                    </span>
                  )}
                  
                  <button 
                    onClick={() => onTaskSelect?.(task)}
                    className="w-full mt-2 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
