import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employerId = searchParams.get('employerId') || ''
    const candidateId = searchParams.get('candidateId') || ''
    const jobId = searchParams.get('jobId') || ''

    const applications = await prisma.application.findMany({
      where: {
        ...(candidateId && { candidateId }),
        ...(jobId && { jobId }),
        ...(employerId && {
          job: { employerId },
        }),
      },
      include: {
        job: {
          include: {
            employer: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
        candidate: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('GET /api/applications error:', error)
    return NextResponse.json({ error: 'Ошибка при получении откликов' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, candidateId, coverNote } = body

    if (!jobId || !candidateId) {
      return NextResponse.json({ error: 'jobId и candidateId обязательны' }, { status: 400 })
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Вакансия не найдена' }, { status: 404 })

    const candidate = await prisma.candidateProfile.findUnique({ where: { id: candidateId } })
    if (!candidate) return NextResponse.json({ error: 'Профиль кандидата не найден' }, { status: 404 })

    const existing = await prisma.application.findUnique({
      where: { candidateId_jobId: { candidateId, jobId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Вы уже откликались на эту вакансию' }, { status: 409 })
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        coverNote: coverNote?.trim() || null,
        status: 'PENDING',
      },
      include: {
        job: true,
        candidate: { include: { user: true } },
      },
    })

    return NextResponse.json({ application, message: 'Отклик успешно отправлен' }, { status: 201 })
  } catch (error) {
    console.error('POST /api/applications error:', error)
    return NextResponse.json({ error: 'Ошибка при отправке отклика' }, { status: 500 })
  }
}
