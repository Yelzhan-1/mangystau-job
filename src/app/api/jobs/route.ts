import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const sector = searchParams.get('sector') || ''
    const employmentType = searchParams.get('employmentType') || ''
    const experienceLevel = searchParams.get('experienceLevel') || ''
    const city = searchParams.get('city') || ''
    const district = searchParams.get('district') || ''
    const employerId = searchParams.get('employerId') || ''

    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(sector && { sector }),
        ...(employmentType && { employmentType }),
        ...(experienceLevel && { experienceLevel }),
        ...(city && { city }),
        ...(district && { district }),
        ...(employerId && { employerId }),
      },
      include: {
        employer: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('GET /api/jobs error:', error)
    return NextResponse.json({ error: 'Ошибка при получении вакансий' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employerId,
      title,
      description,
      sector,
      experienceLevel,
      employmentType,
      city,
      district,
      skills,
      salaryMin,
      salaryMax,
    } = body

    if (!employerId || !title || !description || !sector || !experienceLevel || !employmentType || !city) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    const employer = await prisma.employerProfile.findUnique({ where: { id: employerId } })
    if (!employer) {
      return NextResponse.json({ error: 'Работодатель не найден' }, { status: 404 })
    }

    const job = await prisma.job.create({
      data: {
        employerId,
        title: title.trim(),
        description: description.trim(),
        sector,
        experienceLevel,
        employmentType,
        city: city.trim(),
        district: district?.trim() || '',
        skills: Array.isArray(skills) ? JSON.stringify(skills) : skills || '[]',
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        isActive: true,
      },
      include: {
        employer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    })

    return NextResponse.json({ job, message: 'Вакансия успешно создана' }, { status: 201 })
  } catch (error) {
    console.error('POST /api/jobs error:', error)
    return NextResponse.json({ error: 'Ошибка при создании вакансии' }, { status: 500 })
  }
}
