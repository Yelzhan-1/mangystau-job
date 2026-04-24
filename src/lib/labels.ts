export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Полная занятость',
  PART_TIME: 'Подработка',
  INTERNSHIP: 'Стажировка',
  CONTRACT: 'Контракт',
  SEASONAL: 'Сезонная работа',
}

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  NO_EXPERIENCE: 'Без опыта',
  JUNIOR: 'Начинающий',
  MIDDLE: 'Средний опыт',
  SENIOR: 'Опытный',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Новый',
  VIEWED: 'Просмотрен',
  SHORTLISTED: 'В шорт-листе',
  REJECTED: 'Отклонён',
  HIRED: 'Нанят',
}

export const APPLICATION_STATUS_BADGE: Record<string, 'yellow' | 'blue' | 'green' | 'red' | 'slate'> = {
  PENDING: 'yellow',
  VIEWED: 'blue',
  SHORTLISTED: 'green',
  REJECTED: 'red',
  HIRED: 'green',
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Договорная'
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `от ${fmt(min)}`
  if (max) return `до ${fmt(max)}`
  return 'Договорная'
}

export function parseSkills(skills: string | null | undefined): string[] {
  if (!skills) return []
  try {
    const parsed = JSON.parse(skills)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
}
