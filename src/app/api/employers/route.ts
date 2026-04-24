import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employers = await prisma.employerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ employers })
  } catch (error) {
    console.error('GET /api/employers error:', error)
    return NextResponse.json({ error: 'Ошибка при получении работодателей' }, { status: 500 })
  }
}
