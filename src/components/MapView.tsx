'use client'

import { useEffect, useRef } from 'react'

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
  markers: MapMarker[]
  height?: string
}

// The Gambia geographic centre
const CENTER: [number, number] = [13.4549, -16.5790]

const SUPPLIER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/><circle fill="white" cx="12" cy="12" r="5"/></svg>`
const CONTRACTOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path fill="#f59e0b" stroke="#d97706" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/><circle fill="white" cx="12" cy="12" r="5"/></svg>`

function svgIcon(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function MapView({ markers, height = '500px' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // keep a ref to the map instance so we can destroy it on unmount / re-render
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Destroy any previously initialised map on the same container
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    let destroyed = false

    // Dynamically import Leaflet (runs only in browser, inside useEffect)
    import('leaflet').then(mod => {
      if (destroyed || !containerRef.current) return

      const L = mod.default ?? mod

      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id   = 'leaflet-css'
        link.rel  = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Fix broken webpack icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Initialise map
      const map = L.map(containerRef.current).setView(CENTER, 10)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Custom icons
      const supplierIcon = L.icon({
        iconUrl:     svgIcon(SUPPLIER_SVG),
        iconSize:    [24, 36],
        iconAnchor:  [12, 36],
        popupAnchor: [0, -38],
      })
      const contractorIcon = L.icon({
        iconUrl:     svgIcon(CONTRACTOR_SVG),
        iconSize:    [24, 36],
        iconAnchor:  [12, 36],
        popupAnchor: [0, -38],
      })

      // Add markers
      markers.forEach(m => {
        const icon = m.type === 'supplier' ? supplierIcon : contractorIcon
        const profilePath = m.type === 'supplier' ? 'suppliers' : 'contractors'
        const verifiedBadge = m.verified
          ? `<span style="color:#16a34a;font-size:11px"> ✓ Verified</span>`
          : ''
        const specialtyLine = m.specialty
          ? `<p style="margin:2px 0;font-size:11px;color:#6b7280">${m.specialty}</p>`
          : ''
        const locationLine = m.location
          ? `<p style="margin:2px 0;font-size:11px;color:#9ca3af">${m.location}</p>`
          : ''

        const popup = `
          <div style="min-width:150px;font-family:sans-serif">
            <div style="font-weight:700;font-size:13px;margin-bottom:2px">
              ${m.name}${verifiedBadge}
            </div>
            ${specialtyLine}${locationLine}
            <a href="/${profilePath}/${m.id}"
               style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:500">
              View profile →
            </a>
          </div>`

        L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(popup)
      })

      // If we have markers, fit the map to show them all
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
      }
    }).catch(err => {
      console.error('Leaflet failed to load:', err)
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // Re-run whenever markers change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      className="z-0 bg-gray-100"
    />
  )
}
