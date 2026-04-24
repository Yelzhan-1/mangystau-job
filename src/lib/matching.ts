// ── Types ──────────────────────────────────────────────────────────────────

export interface MatchBreakdown {
  skills: number
  location: number
  employmentType: number
  experience: number
  sector: number
  salary: number
}

export interface MatchResult {
  score: number
  reasons: string[]
  weakPoints: string[]
  breakdown: MatchBreakdown
}

// Lightweight shapes used by the engine (avoids importing Prisma types here)
export interface CandidateForMatch {
  id: string
  city: string
  district?: string | null
  skills: string
  experienceLevel: string
  preferredType: string
  sector?: string | null
  user: { name: string }
}

export interface JobForMatch {
  id: string
  title: string
  city: string
  district?: string | null
  skills: string
  experienceLevel: string
  employmentType: string
  sector: string
  salaryMin?: number | null
  salaryMax?: number | null
}

export interface JobMatchResult {
  job: JobForMatch
  score: number
  reasons: string[]
  weakPoints: string[]
  breakdown: MatchBreakdown
}

export interface CandidateMatchResult {
  candidate: CandidateForMatch
  score: number
  reasons: string[]
  weakPoints: string[]
  breakdown: MatchBreakdown
}

// ── Skill parsing ──────────────────────────────────────────────────────────

function parseSkillList(raw: string | null | undefined): string[] {
  if (!raw) return []
  const s = raw.trim()
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map((x: unknown) => String(x).toLowerCase().trim()).filter(Boolean)
    } catch {
      // fall through
    }
  }
  return s
    .split(/,|;/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
}

function skillOverlap(a: string[], b: string[]): { matched: string[]; ratio: number } {
  if (a.length === 0 || b.length === 0) return { matched: [], ratio: 0 }
  const setB = new Set(b)
  const matched = a.filter((s) => setB.has(s))
  // ratio = matched / max(a.length, b.length) so we are fair to both sides
  const ratio = matched.length / Math.max(a.length, b.length)
  return { matched, ratio }
}

// ── Experience compatibility ───────────────────────────────────────────────

const EXP_ORDER: Record<string, number> = {
  NO_EXPERIENCE: 0,
  JUNIOR: 1,
  MIDDLE: 2,
  SENIOR: 3,
}

function experienceScore(jobLevel: string, candidateLevel: string): { score: number; reason: string; weak: string } {
  const jIdx = EXP_ORDER[jobLevel] ?? 0
  const cIdx = EXP_ORDER[candidateLevel] ?? 0

  if (cIdx >= jIdx) {
    // candidate meets or exceeds requirement
    const label: Record<string, string> = {
      NO_EXPERIENCE: 'без опыта',
      JUNIOR: 'начинающий',
      MIDDLE: 'средний опыт',
      SENIOR: 'опытный специалист',
    }
    return {
      score: 100,
      reason: `Опыт кандидата подходит: ${label[candidateLevel] || candidateLevel}.`,
      weak: '',
    }
  }

  const diff = jIdx - cIdx
  if (diff === 1) {
    return {
      score: 55,
      reason: '',
      weak: 'Опыт кандидата немного ниже требуемого — возможно потребуется обучение.',
    }
  }
  return {
    score: 20,
    reason: '',
    weak: 'Уровень опыта кандидата значительно ниже требований вакансии.',
  }
}

// ── Employment type compatibility ──────────────────────────────────────────

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'полная занятость',
  PART_TIME: 'подработка',
  INTERNSHIP: 'стажировка',
  CONTRACT: 'контракт',
  SEASONAL: 'сезонная работа',
}

function employmentTypeScore(jobType: string, preferredType: string): { score: number; reason: string; weak: string } {
  if (jobType === preferredType) {
    return {
      score: 100,
      reason: `Формат работы совпадает: ${EMPLOYMENT_LABELS[jobType] || jobType}.`,
      weak: '',
    }
  }
  // Flexible pairings that work reasonably well
  const flexible: Record<string, string[]> = {
    FULL_TIME: ['CONTRACT'],
    PART_TIME: ['SEASONAL', 'INTERNSHIP'],
    CONTRACT: ['FULL_TIME', 'SEASONAL'],
    SEASONAL: ['PART_TIME', 'CONTRACT'],
    INTERNSHIP: ['PART_TIME'],
  }
  if ((flexible[preferredType] || []).includes(jobType)) {
    return {
      score: 60,
      reason: '',
      weak: `Желаемый формат (${EMPLOYMENT_LABELS[preferredType] || preferredType}) отличается от вакансии (${EMPLOYMENT_LABELS[jobType] || jobType}), но совместим.`,
    }
  }
  return {
    score: 20,
    reason: '',
    weak: `Формат занятости не совпадает: кандидат ищет «${EMPLOYMENT_LABELS[preferredType] || preferredType}», вакансия предлагает «${EMPLOYMENT_LABELS[jobType] || jobType}».`,
  }
}

// ── Location scoring ───────────────────────────────────────────────────────

function locationScore(
  jobCity: string,
  jobDistrict: string | null | undefined,
  candidateCity: string,
  candidateDistrict: string | null | undefined
): { score: number; reason: string; weak: string } {
  const jCity = jobCity.toLowerCase().trim()
  const cCity = candidateCity.toLowerCase().trim()
  const jDist = (jobDistrict || '').toLowerCase().trim()
  const cDist = (candidateDistrict || '').toLowerCase().trim()

  if (jCity !== cCity) {
    return { score: 10, reason: '', weak: `Вакансия в другом городе (${jobCity}), кандидат из ${candidateCity}.` }
  }

  // same city
  if (jDist && cDist && jDist === cDist) {
    return {
      score: 100,
      reason: `Кандидат находится в том же районе: ${jobDistrict}.`,
      weak: '',
    }
  }

  if (jDist && cDist) {
    // both have districts but different — check if same "microrayon family"
    // e.g. Микрорайон 5 and Микрорайон 7 are neighbors
    const jNum = parseInt(jDist.replace(/\D/g, ''), 10)
    const cNum = parseInt(cDist.replace(/\D/g, ''), 10)
    if (!isNaN(jNum) && !isNaN(cNum) && Math.abs(jNum - cNum) <= 3) {
      return {
        score: 75,
        reason: `Кандидат живёт рядом: ${candidateDistrict} — близко к ${jobDistrict}.`,
        weak: '',
      }
    }
    return {
      score: 50,
      reason: `Один город (${jobCity}).`,
      weak: `Район отличается: вакансия в ${jobDistrict}, кандидат из ${candidateDistrict}.`,
    }
  }

  // same city, no district info for one or both
  return { score: 60, reason: `Один город: ${jobCity}.`, weak: '' }
}

// ── Sector scoring ─────────────────────────────────────────────────────────

function sectorScore(jobSector: string, candidateSector?: string | null): { score: number; reason: string; weak: string } {
  if (!candidateSector) return { score: 50, reason: '', weak: '' }
  if (jobSector.toLowerCase() === candidateSector.toLowerCase()) {
    return { score: 100, reason: `Совпадает предпочтительный сектор: ${jobSector}.`, weak: '' }
  }
  return { score: 30, reason: '', weak: `Кандидат предпочитает сектор «${candidateSector}», вакансия из «${jobSector}».` }
}

// ── Salary scoring ─────────────────────────────────────────────────────────

// We don't store expected salary on candidate in base schema, so this is job-side only.
// We give full score when no mismatch can be detected.
function salaryScore(
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined
): { score: number; reason: string; weak: string } {
  if (!salaryMin && !salaryMax) {
    return { score: 50, reason: '', weak: 'Зарплата в вакансии не указана.' }
  }
  const avg = salaryMin && salaryMax ? (salaryMin + salaryMax) / 2 : salaryMin || salaryMax || 0
  // No candidate expected salary in schema — give full marks if salary is present
  if (avg >= 100000) {
    return { score: 100, reason: `Конкурентная зарплата: ${formatSalaryLocal(salaryMin, salaryMax)}.`, weak: '' }
  }
  if (avg >= 60000) {
    return { score: 70, reason: `Зарплата: ${formatSalaryLocal(salaryMin, salaryMax)}.`, weak: '' }
  }
  return { score: 45, reason: '', weak: `Зарплата ниже средней: ${formatSalaryLocal(salaryMin, salaryMax)}.` }
}

function formatSalaryLocal(min?: number | null, max?: number | null): string {
  const fmt = (n: number) => `${n.toLocaleString('ru-KZ')} ₸`
  if (min && max) return `${fmt(min)}–${fmt(max)}`
  if (min) return `от ${fmt(min)}`
  if (max) return `до ${fmt(max)}`
  return 'не указана'
}

// ── WEIGHTS ────────────────────────────────────────────────────────────────

const W = {
  skills: 0.35,
  location: 0.20,
  employmentType: 0.15,
  experience: 0.10,
  sector: 0.10,
  salary: 0.10,
}

// ── Core calculation ───────────────────────────────────────────────────────

export function calculateJobMatch(candidate: CandidateForMatch, job: JobForMatch): MatchResult {
  const reasons: string[] = []
  const weakPoints: string[] = []

  // Skills
  const cSkills = parseSkillList(candidate.skills)
  const jSkills = parseSkillList(job.skills)
  const { matched, ratio } = skillOverlap(cSkills, jSkills)
  const skillsRaw = Math.round(ratio * 100)
  if (matched.length >= 3) {
    reasons.push(`Совпадают ${matched.length} навыка: ${matched.slice(0, 3).join(', ')}.`)
  } else if (matched.length > 0) {
    reasons.push(`Совпадает ${matched.length} навык: ${matched.join(', ')}.`)
  } else {
    weakPoints.push('Совпадающих навыков не найдено — возможно потребуется дополнительное обучение.')
  }

  // Location
  const loc = locationScore(job.city, job.district, candidate.city, candidate.district)
  if (loc.reason) reasons.push(loc.reason)
  if (loc.weak) weakPoints.push(loc.weak)

  // Employment type
  const emp = employmentTypeScore(job.employmentType, candidate.preferredType)
  if (emp.reason) reasons.push(emp.reason)
  if (emp.weak) weakPoints.push(emp.weak)

  // Experience
  const exp = experienceScore(job.experienceLevel, candidate.experienceLevel)
  if (exp.reason) reasons.push(exp.reason)
  if (exp.weak) weakPoints.push(exp.weak)

  // Sector
  const sec = sectorScore(job.sector, candidate.sector)
  if (sec.reason) reasons.push(sec.reason)
  if (sec.weak) weakPoints.push(sec.weak)

  // Salary
  const sal = salaryScore(job.salaryMin, job.salaryMax)
  if (sal.reason) reasons.push(sal.reason)
  if (sal.weak) weakPoints.push(sal.weak)

  const breakdown: MatchBreakdown = {
    skills: skillsRaw,
    location: loc.score,
    employmentType: emp.score,
    experience: exp.score,
    sector: sec.score,
    salary: sal.score,
  }

  const weightedScore =
    breakdown.skills * W.skills +
    breakdown.location * W.location +
    breakdown.employmentType * W.employmentType +
    breakdown.experience * W.experience +
    breakdown.sector * W.sector +
    breakdown.salary * W.salary

  const score = Math.min(100, Math.max(0, Math.round(weightedScore)))

  return { score, reasons, weakPoints, breakdown }
}

export function calculateCandidateMatch(job: JobForMatch, candidate: CandidateForMatch): MatchResult {
  // Symmetric calculation — same algorithm, same result
  return calculateJobMatch(candidate, job)
}

// ── Ranked lists ───────────────────────────────────────────────────────────

export function matchJobsForCandidate(
  candidate: CandidateForMatch,
  jobs: JobForMatch[]
): JobMatchResult[] {
  return jobs
    .map((job) => {
      const result = calculateJobMatch(candidate, job)
      return { job, ...result }
    })
    .sort((a, b) => b.score - a.score)
}

export function matchCandidatesForJob(
  job: JobForMatch,
  candidates: CandidateForMatch[]
): CandidateMatchResult[] {
  return candidates
    .map((candidate) => {
      const result = calculateCandidateMatch(job, candidate)
      return { candidate, ...result }
    })
    .sort((a, b) => b.score - a.score)
}
