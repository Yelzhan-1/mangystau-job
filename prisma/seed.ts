import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Mangystau Jobs database...')

  // --- Employers ---
  const employer1User = await prisma.user.upsert({
    where: { email: 'hr@caspian-logistics.kz' },
    update: {},
    create: {
      email: 'hr@caspian-logistics.kz',
      name: 'Айгерим Бекова',
      phone: '+7 701 234 5678',
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Caspian Logistics',
          businessType: 'Логистика и доставка',
          city: 'Актау',
          district: 'Микрорайон 12',
          contactPhone: '+7 701 234 5678',
          description: 'Ведущая логистическая компания Мангистауской области.',
          isVerified: true,
        },
      },
    },
    include: { employerProfile: true },
  })

  const employer2User = await prisma.user.upsert({
    where: { email: 'admin@aktau-cafe.kz' },
    update: {},
    create: {
      email: 'admin@aktau-cafe.kz',
      name: 'Нурлан Сейткали',
      phone: '+7 702 345 6789',
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Кафе «Каспий»',
          businessType: 'Общественное питание',
          city: 'Актау',
          district: 'Микрорайон 7',
          contactPhone: '+7 702 345 6789',
          description: 'Уютное кафе в центре Актау. Домашняя кухня и современные блюда.',
          isVerified: true,
        },
      },
    },
    include: { employerProfile: true },
  })

  const employer1Profile = employer1User.employerProfile!
  const employer2Profile = employer2User.employerProfile!

  // --- Jobs ---
  const job1 = await prisma.job.create({
    data: {
      title: 'Курьер-доставщик',
      description: 'Ищем ответственного курьера для доставки заказов по городу Актау. Наличие велосипеда или самоката приветствуется. Гибкий график, еженедельная оплата.',
      sector: 'Доставка',
      experienceLevel: 'NO_EXPERIENCE',
      employmentType: 'PART_TIME',
      city: 'Актау',
      district: 'Микрорайон 12',
      salaryMin: 80000,
      salaryMax: 150000,
      skills: JSON.stringify(['Ответственность', 'Знание города', 'Коммуникабельность']),
      employerId: employer1Profile.id,
    },
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Оператор склада',
      description: 'Требуется оператор склада для сортировки и учёта грузов. Опыт работы не обязателен — обучим. Полная занятость, официальное трудоустройство.',
      sector: 'Логистика',
      experienceLevel: 'NO_EXPERIENCE',
      employmentType: 'FULL_TIME',
      city: 'Актау',
      district: 'Промзона',
      salaryMin: 120000,
      salaryMax: 180000,
      skills: JSON.stringify(['Внимательность', 'Физическая выносливость', '1С (желательно)']),
      employerId: employer1Profile.id,
    },
  })

  const job3 = await prisma.job.create({
    data: {
      title: 'Официант / Официантка',
      description: 'Кафе «Каспий» приглашает на работу официантов. Дружная команда, чаевые, бесплатное питание в смену. Обучаем с нуля.',
      sector: 'Общественное питание',
      experienceLevel: 'NO_EXPERIENCE',
      employmentType: 'FULL_TIME',
      city: 'Актау',
      district: 'Микрорайон 7',
      salaryMin: 90000,
      salaryMax: 130000,
      skills: JSON.stringify(['Вежливость', 'Стрессоустойчивость', 'Скорость']),
      employerId: employer2Profile.id,
    },
  })

  const job4 = await prisma.job.create({
    data: {
      title: 'Помощник повара',
      description: 'Ищем помощника повара — нарезка, заготовки, чистота на кухне. Опыт не требуется. Работа в стабильном заведении.',
      sector: 'Общественное питание',
      experienceLevel: 'NO_EXPERIENCE',
      employmentType: 'FULL_TIME',
      city: 'Актау',
      district: 'Микрорайон 7',
      salaryMin: 85000,
      salaryMax: 110000,
      skills: JSON.stringify(['Чистоплотность', 'Пунктуальность', 'Желание учиться']),
      employerId: employer2Profile.id,
    },
  })

  const job5 = await prisma.job.create({
    data: {
      title: 'Водитель-экспедитор',
      description: 'Требуется водитель для развоза грузов по Актау и Мангистауской области. Категория B обязательна. Автомобиль компании.',
      sector: 'Логистика',
      experienceLevel: 'JUNIOR',
      employmentType: 'FULL_TIME',
      city: 'Актау',
      district: 'Промзона',
      salaryMin: 180000,
      salaryMax: 250000,
      skills: JSON.stringify(['Водительские права кат. B', 'Знание дорог', 'Ответственность']),
      employerId: employer1Profile.id,
    },
  })

  // --- Candidates ---
  const candidate1User = await prisma.user.upsert({
    where: { email: 'aibek@mail.ru' },
    update: {},
    create: {
      email: 'aibek@mail.ru',
      name: 'Айбек Джаксыбеков',
      phone: '+7 705 111 2233',
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          bio: 'Студент 3-го курса КГУТИ. Ищу подработку на неполный день.',
          city: 'Актау',
          district: 'Микрорайон 5',
          skills: JSON.stringify(['Вождение', 'Коммуникабельность', 'MS Office']),
          experienceLevel: 'NO_EXPERIENCE',
          preferredType: 'PART_TIME',
          sector: 'Доставка',
          isAvailable: true,
        },
      },
    },
    include: { candidateProfile: true },
  })

  const candidate2User = await prisma.user.upsert({
    where: { email: 'madina.k@gmail.com' },
    update: {},
    create: {
      email: 'madina.k@gmail.com',
      name: 'Мадина Касымова',
      phone: '+7 707 222 3344',
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          bio: 'Выпускница колледжа по специальности «Технолог питания».',
          city: 'Актау',
          district: 'Микрорайон 27',
          skills: JSON.stringify(['Приготовление пищи', 'Санитарные нормы', 'Работа в команде']),
          experienceLevel: 'JUNIOR',
          preferredType: 'FULL_TIME',
          sector: 'Общественное питание',
          isAvailable: true,
        },
      },
    },
    include: { candidateProfile: true },
  })

  const candidate3User = await prisma.user.upsert({
    where: { email: 'damir.s@yandex.kz' },
    update: {},
    create: {
      email: 'damir.s@yandex.kz',
      name: 'Дамир Сатыбалдиев',
      phone: '+7 708 333 4455',
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          bio: 'Активный молодой человек, 20 лет. Опыт работы на складе 6 месяцев.',
          city: 'Актау',
          district: 'Промзона',
          skills: JSON.stringify(['Складской учёт', '1С Склад', 'Погрузчик']),
          experienceLevel: 'JUNIOR',
          preferredType: 'FULL_TIME',
          sector: 'Логистика',
          isAvailable: true,
        },
      },
    },
    include: { candidateProfile: true },
  })

  const c1 = candidate1User.candidateProfile!
  const c2 = candidate2User.candidateProfile!
  const c3 = candidate3User.candidateProfile!

  // --- Applications ---
  await prisma.application.upsert({
    where: { candidateId_jobId: { candidateId: c1.id, jobId: job1.id } },
    update: {},
    create: {
      candidateId: c1.id,
      jobId: job1.id,
      status: 'VIEWED',
      coverNote: 'Знаю город хорошо, есть велосипед. Готов к работе.',
    },
  })

  await prisma.application.upsert({
    where: { candidateId_jobId: { candidateId: c2.id, jobId: job3.id } },
    update: {},
    create: {
      candidateId: c2.id,
      jobId: job3.id,
      status: 'SHORTLISTED',
      coverNote: 'Выпускница по специальности технолог питания, готова работать официантом.',
    },
  })

  await prisma.application.upsert({
    where: { candidateId_jobId: { candidateId: c3.id, jobId: job2.id } },
    update: {},
    create: {
      candidateId: c3.id,
      jobId: job2.id,
      status: 'PENDING',
      coverNote: 'Есть опыт работы на складе 6 месяцев. Готов к полной занятости.',
    },
  })

  await prisma.application.upsert({
    where: { candidateId_jobId: { candidateId: c2.id, jobId: job4.id } },
    update: {},
    create: {
      candidateId: c2.id,
      jobId: job4.id,
      status: 'PENDING',
      coverNote: 'Хочу расти в профессии повара.',
    },
  })

  console.log('✅ Seed completed!')
  console.log('   👔 Employers: 2')
  console.log('   👤 Candidates: 3')
  console.log('   💼 Jobs: 5')
  console.log('   📝 Applications: 4')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
