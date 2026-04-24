import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_STATUSES = ['PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Недопустимый статус. Разрешены: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Отклик не найден' }, { status: 404 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        candidate: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    return NextResponse.json({ application, message: 'Статус обновлён' })
  } catch (error) {
    console.error('PATCH /api/applications/[id] error:', error)
    return NextResponse.json({ error: 'Ошибка при обновлении статуса' }, { status: 500 })
  }
}
