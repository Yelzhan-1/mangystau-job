import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchCandidatesForJob } from '@/lib/matching'
import { generateMatchExplanation } from '@/lib/aiExplain'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId обязателен' }, { status: 400 })
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Вакансия не найдена' }, { status: 404 })
    }

    const candidates = await prisma.candidateProfile.findMany({
      where: { isAvailable: true },
      include: { user: { select: { name: true, email: true, phone: true } } },
    })

    const ranked = matchCandidatesForJob(job, candidates)

    const results = await Promise.all(
      ranked.map(async ({ candidate, score, reasons, weakPoints, breakdown }) => {
        const explanation = await generateMatchExplanation({
          matchResult: { score, reasons, weakPoints, breakdown },
          jobTitle: job.title,
          candidateName: candidate.user.name,
          mode: 'candidate-for-job',
        })
        return { candidate, score, reasons, weakPoints, breakdown, explanation }
      })
    )

    return NextResponse.json({ job, results })
  } catch (error) {
    console.error('GET /api/ai/candidates-for-job error:', error)
    return NextResponse.json({ error: 'Ошибка при поиске кандидатов' }, { status: 500 })
  }
}
