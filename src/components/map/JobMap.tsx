'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { getCoordinatesForDistrict, getMarkerColorBySector, AKTAU_MAP_CENTER, AKTAU_MAP_ZOOM } from '@/lib/mapData'
import { formatSalary, parseSkills, EMPLOYMENT_TYPE_LABELS } from '@/lib/labels'

export interface JobForMap {
  id: string
  title: string
  sector: string
  employmentType: string
  city: string
  district: string | null
  salaryMin: number | null
  salaryMax: number | null
  skills: string
  employer: { companyName: string }
}

interface JobMapProps {
  jobs: JobForMap[]
  height?: number
  className?: string
  showAiLink?: boolean
}

export default function JobMap({ jobs, height = 460, className = '', showAiLink = true }: JobMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: AKTAU_MAP_CENTER,
        zoom: AKTAU_MAP_ZOOM,
        zoomControl: true,
        attributionControl: true,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Group jobs by district to offset overlapping markers
      const districtGroups: Record<string, JobForMap[]> = {}
      for (const job of jobs) {
        const key = job.district || job.city || 'Актау'
        if (!districtGroups[key]) districtGroups[key] = []
        districtGroups[key].push(job)
      }

      for (const [district, groupJobs] of Object.entries(districtGroups)) {
        const coord = getCoordinatesForDistrict(district)

        groupJobs.forEach((job, idx) => {
          // Slight offset for stacked markers in same district
          const offsetLat = coord.lat + (idx * 0.0008)
          const offsetLng = coord.lng + (idx * 0.0005)
          const color = getMarkerColorBySector(job.sector)

          const icon = L.divIcon({
            className: '',
            html: `
              <div style="
                background: ${color};
                border: 2.5px solid white;
                border-radius: 50%;
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 10px rgba(0,0,0,0.25);
                cursor: pointer;
                font-size: 15px;
                transition: transform 0.15s;
              " title="${job.title}">💼</div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -20],
          })

          const skills = parseSkills(job.skills).slice(0, 3)
          const salary = formatSalary(job.salaryMin, job.salaryMax)
          const empType = EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType
          const aiLink = showAiLink ? `<a href="/ai-match?jobId=${job.id}" style="color:#2563EB;text-decoration:underline;font-size:11px;">ИИ-анализ →</a>` : ''

          const popupHtml = `
            <div style="min-width:220px;max-width:260px;padding:14px 16px;font-family:system-ui,sans-serif;">
              <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:3px;">${job.title}</div>
              <div style="font-size:12px;color:#64748B;margin-bottom:8px;">${job.employer.companyName}</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                <span style="background:#EFF6FF;color:#2563EB;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:600;">${empType}</span>
                <span style="background:#F1F5F9;color:#475569;font-size:11px;padding:2px 8px;border-radius:99px;">${job.sector}</span>
              </div>
              <div style="font-size:12px;color:#0F172A;margin-bottom:4px;">📍 ${job.district || job.city}</div>
              <div style="font-size:13px;font-weight:700;color:#2563EB;margin-bottom:8px;">${salary}</div>
              ${skills.length ? `<div style="font-size:11px;color:#64748B;">${skills.join(' · ')}</div>` : ''}
              <div style="margin-top:10px;display:flex;gap:8px;align-items:center;">
                <a href="/jobs" style="background:#2563EB;color:white;text-decoration:none;font-size:12px;font-weight:600;padding:5px 12px;border-radius:7px;">Откликнуться</a>
                ${aiLink}
              </div>
            </div>
          `

          const marker = L.marker([offsetLat, offsetLng], { icon })
          marker.bindPopup(popupHtml, { maxWidth: 280, minWidth: 220 })
          marker.addTo(map)
        })
      }

      // Fit bounds if jobs exist
      if (jobs.length > 0) {
        const latLngs = jobs.map((j) => {
          const c = getCoordinatesForDistrict(j.district)
          return [c.lat, c.lng] as [number, number]
        })
        try {
          map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 14 })
        } catch {
          map.setView(AKTAU_MAP_CENTER, AKTAU_MAP_ZOOM)
        }
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (jobs.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 ${className}`}
        style={{ height }}
      >
        <MapPin className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-slate-400 text-sm">Нет вакансий для отображения на карте</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
        <p className="text-xs font-semibold text-slate-700 mb-1.5">Секторы</p>
        <div className="space-y-1">
          {[
            { color: '#2563EB', label: 'Разное' },
            { color: '#F59E0B', label: 'Питание' },
            { color: '#0EA5E9', label: 'Логистика' },
            { color: '#8B5CF6', label: 'Торговля' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: item.color }} />
              <span className="text-[10px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
