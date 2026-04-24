# 🇰🇿 MangystauJobs

> Локальная AI-платформа для поиска работы и сотрудников в Мангистауской области Казахстана.

**Hackathon MVP** — Next.js 15 · TypeScript · Prisma · SQLite → PostgreSQL · Tailwind CSS · AI-matching · Telegram Bot

---

## ✨ О проекте

MangystauJobs решает реальную проблему: работодатели в Актау публикуют вакансии в WhatsApp-чатах, а молодёжь не видит возможности рядом с домом. Платформа собирает локальные вакансии, даёт ИИ-подбор по профилю и отправляет уведомления в Telegram.

### Ключевые возможности (MVP)
- 📍 Поиск вакансий по микрорайонам Актау
- 🤖 ИИ-скоринг совпадения кандидата и вакансии
- 💼 Форма создания профиля соискателя
- 🏢 Форма публикации вакансии для работодателя
- 📊 Дашборд с откликами и рекомендациями
- 💬 Подготовленная архитектура для Telegram-уведомлений

---

## 🏗️ Стек технологий

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Стили | Tailwind CSS 4, кастомная дизайн-система |
| ORM | Prisma 5 |
| БД (dev) | SQLite |
| БД (prod) | PostgreSQL / Supabase |
| Иконки | lucide-react |
| AI (Prompt 2+) | Anthropic Claude API |
| Бот (Prompt 3+) | Telegram Bot API |

---

## 🚀 Быстрый старт

### 1. Создай проект

```bash
npx create-next-app@latest mangystau-jobs \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack
cd mangystau-jobs
```

### 2. Установи зависимости

```bash
npm install prisma @prisma/client clsx tailwind-merge lucide-react
npm install -D ts-node
```

### 3. Скопируй файлы проекта

Замени все файлы из этого репозитория (все пути внутри папки `mangystau-jobs`).

### 4. Настрой переменные окружения

```bash
cp .env.example .env
# .env уже содержит DATABASE_URL="file:./dev.db" — менять не нужно для dev
```

### 5. Инициализируй Prisma и базу данных

```bash
npx prisma generate          # Генерация Prisma Client
npx prisma migrate dev --name init   # Создание БД и таблиц
npm run prisma:seed          # Заполнение демо-данными
```

### 6. Запусти проект

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Структура проекта

```
mangystau-jobs/
├── prisma/
│   ├── schema.prisma          # Модели БД
│   └── seed.ts                # Демо-данные
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Navbar + Footer)
│   │   ├── globals.css        # Глобальные стили
│   │   ├── page.tsx           # Главная страница
│   │   ├── jobs/page.tsx      # Список вакансий + фильтры
│   │   ├── candidate/page.tsx # Профиль соискателя
│   │   ├── employer/page.tsx  # Публикация вакансии
│   │   ├── ai-match/page.tsx  # ИИ-подбор
│   │   └── dashboard/page.tsx # Личный кабинет
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   └── lib/
│       ├── constants.ts       # Районы, секторы, демо-данные
│       ├── types.ts           # TypeScript типы с Prisma relations
│       ├── utils.ts           # cn(), formatSalary(), timeAgo()
│       └── prisma.ts          # Prisma singleton
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ Скрипты

```bash
npm run dev             # Запуск dev-сервера
npm run build           # Production build
npm run prisma:generate # Генерация Prisma Client после изменений схемы
npm run prisma:migrate  # Применение новых миграций
npm run prisma:seed     # Заполнение БД демо-данными
npm run db:reset        # Сброс БД + повторный seed
```

---

## 🔮 Следующие шаги (Prompt 2+)

- **API Routes** — `/api/jobs`, `/api/applications`, `/api/candidates`
- **AI-matching** — интеграция с Claude API для скоринга совпадения
- **Telegram Bot** — уведомления через webhooks
- **Auth** — NextAuth.js с Telegram Login
- **PostgreSQL** — переход на Supabase для production

---

## 🌊 Переход на PostgreSQL / Supabase

1. Создай проект в [supabase.com](https://supabase.com)
2. Скопируй `DATABASE_URL` из настроек проекта
3. В `prisma/schema.prisma` замени `provider = "sqlite"` на `provider = "postgresql"`
4. Убери `JSON.stringify()` для полей `skills` — используй `String[]` в схеме
5. Запусти `npx prisma migrate deploy`

---

*Сделано с ❤️ для Мангистауской молодёжи · Hackathon 2025*
