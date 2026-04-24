import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchJobsForCandidate } from '@/lib/matching'
import { generateMatchExplanation } from '@/lib/aiExplain'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get('candidateId')

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId обязателен' }, { status: 400 })
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: { user: { select: { name: true } } },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Кандидат не найден' }, { status: 404 })
    }

    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        employer: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const ranked = matchJobsForCandidate(candidate, jobs)

    const results = await Promise.all(
      ranked.map(async ({ job, score, reasons, weakPoints, breakdown }) => {
        const explanation = await generateMatchExplanation({
          matchResult: { score, reasons, weakPoints, breakdown },
          jobTitle: job.title,
          candidateName: candidate.user.name,
          mode: 'job-for-candidate',
        })
        return { job, score, reasons, weakPoints, breakdown, explanation }
      })
    )

    return NextResponse.json({ candidate, results })
  } catch (error) {
    console.error('GET /api/ai/jobs-for-candidate error:', error)
    return NextResponse.json({ error: 'Ошибка при подборе вакансий' }, { status: 500 })
  }
}
