import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-base">
                Mangystau<span className="text-blue-400">Jobs</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Локальная AI-платформа для поиска работы в Мангистауской области.
              Молодёжь находит работу рядом с домом. Бизнес находит подходящих людей быстро.
            </p>
            <p className="text-xs mt-4 text-slate-500">г. Актау, Мангистауская область, Казахстан</p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Соискателям</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-white transition-colors">Найти вакансию</Link></li>
              <li><Link href="/jobs?view=map" className="hover:text-white transition-colors">Карта вакансий</Link></li>
              <li><Link href="/candidate" className="hover:text-white transition-colors">Создать профиль</Link></li>
              <li><Link href="/ai-match" className="hover:text-white transition-colors">ИИ-подбор</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Работодателям</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/employer" className="hover:text-white transition-colors">Разместить вакансию</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Дашборд</Link></li>
              <li><Link href="/ai-match" className="hover:text-white transition-colors">Найти кандидатов</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2025 MangystauJobs · Hackathon MVP</p>
          <p>Сделано для молодёжи Мангистауской области 🇰🇿</p>
        </div>
      </div>
    </footer>
  )
}
