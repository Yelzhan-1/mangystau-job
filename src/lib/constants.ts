export const APP_NAME = 'Mangystau Jobs'
export const APP_TAGLINE = 'Работа рядом с тобой — находи вакансии и таланты в Мангистау'
export const APP_DESCRIPTION =
  'Локальная платформа для поиска работы и сотрудников в Мангистауской области. Молодёжь находит работу рядом с домом. Бизнес находит подходящих людей быстро.'

// --- Geography ---
export const CITIES = ['Актау', 'Жанаозен', 'Форт-Шевченко', 'Бейнеу', 'Мангистау'] as const

export const AKTAU_DISTRICTS = [
  'Микрорайон 1',
  'Микрорайон 2',
  'Микрорайон 3',
  'Микрорайон 4',
  'Микрорайон 5',
  'Микрорайон 6',
  'Микрорайон 7',
  'Микрорайон 8',
  'Микрорайон 9',
  'Микрорайон 10',
  'Микрорайон 11',
  'Микрорайон 12',
  'Микрорайон 14',
  'Микрорайон 15',
  'Микрорайон 16',
  'Микрорайон 17',
  'Микрорайон 27',
  'Микрорайон 28',
  'Промзона',
  'Центр',
  'Порт',
]

export const ALL_DISTRICTS = AKTAU_DISTRICTS

// --- Job sectors ---
export const SECTORS = [
  'Доставка',
  'Логистика',
  'Общественное питание',
  'Розничная торговля',
  'Строительство',
  'IT и технологии',
  'Образование',
  'Медицина',
  'Охрана',
  'Сервис и ремонт',
  'Нефть и газ',
  'Административный персонал',
  'Маркетинг и реклама',
  'Красота и здоровье',
  'Транспорт',
  'Другое',
] as const

export type Sector = (typeof SECTORS)[number]

// --- Employment types ---
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Полная занятость',
  PART_TIME: 'Частичная занятость',
  INTERNSHIP: 'Стажировка',
  CONTRACT: 'Договор',
  SEASONAL: 'Сезонная',
}

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  NO_EXPERIENCE: 'Без опыта',
  JUNIOR: 'Начинающий (до 1 года)',
  MIDDLE: 'Опытный (1–3 года)',
  SENIOR: 'Эксперт (3+ лет)',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'На рассмотрении',
  VIEWED: 'Просмотрено',
  SHORTLISTED: 'Отобран',
  REJECTED: 'Отказано',
  HIRED: 'Принят',
}

// --- Popular skills ---
export const POPULAR_SKILLS = [
  'Вождение',
  'Коммуникабельность',
  'Знание города',
  'Работа в команде',
  'MS Office',
  '1С',
  'Кассовый аппарат',
  'Физическая выносливость',
  'Ответственность',
  'Пунктуальность',
  'Русский язык',
  'Казахский язык',
  'Английский язык',
  'Водительские права кат. B',
  'Работа с людьми',
]

// --- Hero & marketing copy ---
export const HERO_STATS = [
  { label: 'Вакансий открыто', value: '120+' },
  { label: 'Компаний зарегистрировано', value: '45+' },
  { label: 'Кандидатов в базе', value: '300+' },
]

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Создай профиль',
    description: 'Укажи навыки, опыт и желаемый тип работы — это займёт 2 минуты.',
  },
  {
    step: '02',
    title: 'Находи вакансии рядом',
    description: 'Фильтруй по микрорайону, сектору и графику. Работа — у тебя за углом.',
  },
  {
    step: '03',
    title: 'ИИ подбирает лучшее',
    description: 'Наш алгоритм предложит вакансии под твой профиль без лишнего поиска.',
  },
  {
    step: '04',
    title: 'Откликайся и получай уведомления',
    description: 'Отправь отклик в один клик. Статус придёт в Telegram.',
  },
]

export const PAIN_POINTS = [
  {
    icon: '📱',
    title: 'Вакансии в WhatsApp-чатах',
    description: 'Большинство предложений о работе в Актау теряются в групповых чатах и исчезают через день.',
  },
  {
    icon: '🌐',
    title: 'hh.ru не знает Мангистау',
    description: 'Крупные платформы игнорируют малый бизнес и локальные вакансии Мангистауской области.',
  },
  {
    icon: '🗺️',
    title: 'Работа есть — просто её не видно',
    description: 'Молодёжь не знает о возможностях рядом с домом. Кафе, склады, мастерские ищут людей прямо сейчас.',
  },
]

export const FEATURES = [
  {
    icon: '🤖',
    title: 'ИИ-подбор',
    description: 'Автоматическое сопоставление кандидатов и вакансий по навыкам и локации.',
  },
  {
    icon: '📍',
    title: 'По микрорайону',
    description: 'Ищи работу в своём районе Актау — без долгих поездок.',
  },
  {
    icon: '💬',
    title: 'Telegram-уведомления',
    description: 'Получай оповещения об откликах и новых вакансиях прямо в мессенджер.',
  },
  {
    icon: '⚡',
    title: 'Быстрый отклик',
    description: 'Откликнись в один клик. Работодатель получит заявку сразу.',
  },
]

// --- Demo job cards for static pages ---
export const DEMO_JOBS = [
  {
    id: '1',
    title: 'Курьер-доставщик',
    company: 'Caspian Logistics',
    city: 'Актау',
    district: 'Микрорайон 12',
    sector: 'Доставка',
    employmentType: 'PART_TIME',
    experienceLevel: 'NO_EXPERIENCE',
    salaryMin: 80000,
    salaryMax: 150000,
    skills: ['Ответственность', 'Знание города'],
    postedAt: '2 часа назад',
  },
  {
    id: '2',
    title: 'Официант / Официантка',
    company: 'Кафе «Каспий»',
    city: 'Актау',
    district: 'Микрорайон 7',
    sector: 'Общественное питание',
    employmentType: 'FULL_TIME',
    experienceLevel: 'NO_EXPERIENCE',
    salaryMin: 90000,
    salaryMax: 130000,
    skills: ['Вежливость', 'Стрессоустойчивость'],
    postedAt: '5 часов назад',
  },
  {
    id: '3',
    title: 'Оператор склада',
    company: 'Caspian Logistics',
    city: 'Актау',
    district: 'Промзона',
    sector: 'Логистика',
    employmentType: 'FULL_TIME',
    experienceLevel: 'NO_EXPERIENCE',
    salaryMin: 120000,
    salaryMax: 180000,
    skills: ['Внимательность', 'Физическая выносливость'],
    postedAt: '1 день назад',
  },
  {
    id: '4',
    title: 'Помощник повара',
    company: 'Кафе «Каспий»',
    city: 'Актау',
    district: 'Микрорайон 7',
    sector: 'Общественное питание',
    employmentType: 'FULL_TIME',
    experienceLevel: 'NO_EXPERIENCE',
    salaryMin: 85000,
    salaryMax: 110000,
    skills: ['Чистоплотность', 'Пунктуальность'],
    postedAt: '1 день назад',
  },
  {
    id: '5',
    title: 'Водитель-экспедитор',
    company: 'Caspian Logistics',
    city: 'Актау',
    district: 'Промзона',
    sector: 'Логистика',
    employmentType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    salaryMin: 180000,
    salaryMax: 250000,
    skills: ['Права кат. B', 'Знание дорог'],
    postedAt: '2 дня назад',
  },
]
