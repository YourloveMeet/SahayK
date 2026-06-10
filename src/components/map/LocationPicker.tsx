'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet's default icon issue with Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  defaultPosition?: [number, number]
  centerPosition?: [number, number] | null
}

function MapController({ centerPosition }: { centerPosition?: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (centerPosition) {
      map.flyTo(centerPosition, 16)
    }
  }, [centerPosition, map])
  return null
}

function LocationMarker({ onLocationSelect, defaultPosition, centerPosition }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultPosition ? L.latLng(defaultPosition[0], defaultPosition[1]) : null
  )

  useEffect(() => {
    if (centerPosition) {
      setPosition(L.latLng(centerPosition[0], centerPosition[1]))
    }
  }, [centerPosition])

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function LocationPicker({ onLocationSelect, defaultPosition = [19.0760, 72.8777], centerPosition }: LocationPickerProps) {
  // Center defaults to Mumbai, India (19.0760, 72.8777)
  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
      <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController centerPosition={centerPosition} />
        <LocationMarker onLocationSelect={onLocationSelect} defaultPosition={defaultPosition} centerPosition={centerPosition} />
      </MapContainer>
    </div>
  )
}
