import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseSkillList(raw: string | null | undefined): string[] {
  if (!raw) return []
  const s = raw.trim()
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map((x: unknown) => String(x).trim()).filter(Boolean)
    } catch { /* fall through */ }
  }
  return s.split(/,|;/).map((x) => x.trim()).filter(Boolean)
}

function topN<T extends string>(arr: T[], n: number): { value: T; count: number }[] {
  const counts: Record<string, number> = {}
  for (const item of arr) {
    if (item) counts[item] = (counts[item] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value: value as T, count }))
}

export async function GET() {
  try {
    const [totalJobs, totalCandidates, totalEmployers, jobs, candidates] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.candidateProfile.count(),
      prisma.employerProfile.count(),
      prisma.job.findMany({
        where: { isActive: true },
        select: { sector: true, district: true, skills: true },
      }),
      prisma.candidateProfile.findMany({
        select: { skills: true, district: true, preferredType: true },
      }),
    ])

    const sectors = jobs.map((j) => j.sector).filter(Boolean)
    const jobDistricts = jobs.map((j) => j.district || '').filter(Boolean)
    const allSkills = [
      ...jobs.flatMap((j) => parseSkillList(j.skills)),
      ...candidates.flatMap((c) => parseSkillList(c.skills)),
    ]

    const topSectors = topN(sectors, 3)
    const topDistricts = topN(jobDistricts, 3)
    const topSkills = topN(allSkills, 5)
    const topJobTypes = topN(candidates.map((c) => c.preferredType).filter(Boolean), 3)

    const EMPLOYMENT_LABELS: Record<string, string> = {
      FULL_TIME: 'полная занятость',
      PART_TIME: 'подработка',
      INTERNSHIP: 'стажировка',
      CONTRACT: 'контракт',
      SEASONAL: 'сезонная работа',
    }

    const topSector = topSectors[0]?.value || 'не определён'
    const topDistrict = topDistricts[0]?.value || 'не определён'
    const topSkillsList = topSkills.slice(0, 3).map((s) => s.value).join(', ')
    const topJobType = EMPLOYMENT_LABELS[topJobTypes[0]?.value || ''] || topJobTypes[0]?.value || ''

    const insight =
      `Рынок труда Мангистауской области активен в секторе «${topSector}», ` +
      `наибольший спрос на вакансии в районе ${topDistrict}. ` +
      `Самые востребованные навыки: ${topSkillsList || 'данных пока мало'}. ` +
      `Большинство кандидатов ищут ${topJobType || 'разные форматы работы'}. ` +
      `Платформа помогает молодёжи Актау находить работу рядом с домом без WhatsApp-чатов.`

    return NextResponse.json({
      totalJobs,
      totalCandidates,
      totalEmployers,
      topSectors,
      topDistricts,
      topSkills,
      topJobTypes,
      insight,
    })
  } catch (error) {
    console.error('GET /api/ai/summary error:', error)
    return NextResponse.json({ error: 'Ошибка при получении аналитики' }, { status: 500 })
  }
}
