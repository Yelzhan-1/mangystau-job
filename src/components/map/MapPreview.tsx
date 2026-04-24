'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import type { JobForMap } from './JobMap'

const JobMap = dynamic(() => import('./JobMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center">
      <MapPin className="w-6 h-6 text-slate-400" />
    </div>
  ),
})

export default function MapPreview() {
  const [jobs, setJobs] = useState<JobForMap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs?limit=8')
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Карта вакансий</h3>
            <p className="text-xs text-slate-500">Найди работу рядом с домом</p>
          </div>
        </div>
        <Link
          href="/jobs"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Все вакансии <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="h-64 bg-slate-50 rounded-xl animate-pulse flex items-center justify-center">
            <MapPin className="w-6 h-6 text-slate-300" />
          </div>
        ) : (
          <JobMap jobs={jobs} height={264} showAiLink />
        )}
      </div>
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {jobs.length > 0 ? `${jobs.length} вакансий на карте` : 'Добавьте вакансии чтобы увидеть их на карте'}
        </p>
        <Link href="/jobs" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          Смотреть все <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
