'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export type MapMarker = {
  id:         string
  name:       string
  lat:        number
  lng:        number
  type:       'supplier' | 'contractor'
  verified?:  boolean
  specialty?: string
  location?:  string
}

type Props = {
  markers:  MapMarker[]
  height?:  string
}

// Fix Leaflet default icon paths broken by webpack/Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Icon.Default.prototype as any)._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

const supplierIcon = new Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>
  `)}`,
  iconSize:   [24, 36],
  iconAnchor: [12, 36],
  popupAnchor:[0, -38],
})

const contractorIcon = new Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="#f59e0b" stroke="#d97706" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>
  `)}`,
  iconSize:   [24, 36],
  iconAnchor: [12, 36],
  popupAnchor:[0, -38],
})

export default function MapView({ markers, height = '500px' }: Props) {
  useEffect(() => { fixLeafletIcons() }, [])

  // The Gambia centre
  const CENTER: [number, number] = [13.4549, -16.5790]

  return (
    <MapContainer
      center={CENTER}
      zoom={10}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(m => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={m.type === 'supplier' ? supplierIcon : contractorIcon}
        >
          <Popup>
            <div className="text-sm min-w-[150px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-gray-900">{m.name}</span>
                {m.verified && (
                  <ShieldCheck size={12} className="text-green-500" />
                )}
              </div>
              {m.specialty && <p className="text-xs text-gray-500 mb-0.5">{m.specialty}</p>}
              {m.location  && <p className="text-xs text-gray-400 mb-2">{m.location}</p>}
              <Link
                href={`/${m.type === 'supplier' ? 'suppliers' : 'contractors'}/${m.id}`}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View profile →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
