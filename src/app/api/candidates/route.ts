import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidateProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('GET /api/candidates error:', error)
    return NextResponse.json({ error: 'Ошибка при получении кандидатов' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      phone,
      city,
      district,
      skills,
      experienceLevel,
      preferredJobType,
      bio,
    } = body

    if (!name || !email || !phone || !city || !skills || !experienceLevel || !preferredJobType) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Пользователь с таким email уже зарегистрирован' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'CANDIDATE',
        candidateProfile: {
          create: {
            city: city.trim(),
            district: district?.trim() || '',
            skills: Array.isArray(skills) ? JSON.stringify(skills) : skills || '[]',
            experienceLevel,
            preferredType: preferredJobType,
            bio: bio?.trim() || null,
            isAvailable: true,
          },
        },
      },
      include: {
        candidateProfile: true,
      },
    })

    return NextResponse.json(
      { user, message: 'Профиль успешно создан' },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/candidates error:', error)
    return NextResponse.json({ error: 'Ошибка при создании профиля' }, { status: 500 })
  }
}
