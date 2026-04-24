import type { MatchResult } from './matching'

export interface ExplainInput {
  matchResult: MatchResult
  jobTitle?: string
  candidateName?: string
  mode: 'job-for-candidate' | 'candidate-for-job'
}

// Build a clean Russian explanation from local scoring data
function buildLocalExplanation(input: ExplainInput): string {
  const { matchResult, jobTitle, candidateName, mode } = input
  const { score, reasons, weakPoints } = matchResult

  const subjectLabel =
    mode === 'job-for-candidate'
      ? `вакансия «${jobTitle || 'не указана'}»`
      : `кандидат ${candidateName || 'не указан'}`

  let text = `Совпадение: ${score}%. `

  if (score >= 85) {
    text += `Отличный результат — ${subjectLabel} очень хорошо подходит. `
  } else if (score >= 65) {
    text += `Хороший результат — ${subjectLabel} подходит по основным критериям. `
  } else if (score >= 45) {
    text += `Частичное совпадение — ${subjectLabel} может подойти с некоторыми оговорками. `
  } else {
    text += `Низкое совпадение — ${subjectLabel} подходит слабо. `
  }

  if (reasons.length > 0) {
    text += `Плюсы: ${reasons.slice(0, 3).join(' ')} `
  }

  if (weakPoints.length > 0) {
    text += `Стоит учесть: ${weakPoints.slice(0, 2).join(' ')}`
  }

  return text.trim()
}

// Attempt LLM explanation via Anthropic SDK — safe dynamic import
async function tryAnthropicExplanation(input: ExplainInput): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    // Dynamic import so the app doesn't crash if SDK is not installed
    const mod = await import('@anthropic-ai/sdk').catch(() => null)
    if (!mod) return null

    const Anthropic = mod.default
    const client = new Anthropic({ apiKey })

    const { matchResult, jobTitle, candidateName, mode } = input
    const { score, reasons, weakPoints, breakdown } = matchResult

    const prompt =
      mode === 'job-for-candidate'
        ? `Ты — ИИ-помощник казахстанской платформы трудоустройства MangystauJobs.
Вакансия «${jobTitle}» получила оценку совпадения ${score}% для кандидата.
Данные: навыки ${breakdown.skills}%, локация ${breakdown.location}%, тип занятости ${breakdown.employmentType}%, опыт ${breakdown.experience}%, сектор ${breakdown.sector}%, зарплата ${breakdown.salary}%.
Плюсы: ${reasons.join('; ')}.
Минусы: ${weakPoints.join('; ')}.
Напиши ОДНО короткое объяснение (2-3 предложения) на русском языке. Будь конкретным и полезным. Не повторяй числа дословно.`
        : `Ты — ИИ-помощник казахстанской платформы трудоустройства MangystauJobs.
Кандидат ${candidateName} получил оценку совпадения ${score}% для данной вакансии.
Данные: навыки ${breakdown.skills}%, локация ${breakdown.location}%, тип занятости ${breakdown.employmentType}%, опыт ${breakdown.experience}%, сектор ${breakdown.sector}%, зарплата ${breakdown.salary}%.
Плюсы: ${reasons.join('; ')}.
Минусы: ${weakPoints.join('; ')}.
Напиши ОДНО короткое объяснение (2-3 предложения) на русском языке для работодателя. Будь конкретным и полезным.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type === 'text') return content.text.trim()
    return null
  } catch {
    return null
  }
}

export async function generateMatchExplanation(input: ExplainInput): Promise<string> {
  const llmResult = await tryAnthropicExplanation(input)
  if (llmResult) return llmResult
  return buildLocalExplanation(input)
}
