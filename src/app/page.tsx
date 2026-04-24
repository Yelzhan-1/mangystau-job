"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const problems = [
  {
    title: "Вакансии теряются в чатах",
    text: "Многие предложения о работе в Актау публикуются в WhatsApp-группах и быстро исчезают среди сообщений.",
  },
  {
    title: "Молодёжь не видит работу рядом",
    text: "Студентам и начинающим специалистам сложно понять, какие кафе, магазины, склады и сервисы нанимают в их районе.",
  },
  {
    title: "Бизнес долго ищет людей",
    text: "Малые компании тратят время на ручной поиск кандидатов вместо быстрого и понятного подбора.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Создай профиль",
    text: "Укажи район, навыки, опыт и желаемый формат работы.",
  },
  {
    icon: Search,
    title: "Найди вакансии",
    text: "Ищи предложения по району, сфере, графику и опыту.",
  },
  {
    icon: Sparkles,
    title: "Получи подбор",
    text: "Система показывает, какие вакансии подходят лучше всего.",
  },
  {
    icon: CheckCircle2,
    title: "Откликнись",
    text: "Отправь заявку, а работодатель увидит её в кабинете.",
  },
];

const features = [
  {
    icon: MapPin,
    title: "Карта вакансий",
    text: "Смотри предложения по микрорайонам Актау и находи работу ближе к дому.",
  },
  {
    icon: Sparkles,
    title: "Умный подбор",
    text: "Подбор учитывает навыки, район, опыт, тип занятости, сектор и зарплату.",
  },
  {
    icon: ShieldCheck,
    title: "Проверка объявлений",
    text: "Платформа может использовать модерацию, чтобы снижать риск фейковых вакансий.",
  },
  {
    icon: Building2,
    title: "Кабинет работодателя",
    text: "Компании публикуют вакансии, получают отклики и управляют статусами кандидатов.",
  },
];

function JobPreviewCard({
  title,
  company,
  district,
  salary,
  match,
}: {
  title: string;
  company: string;
  district: string;
  salary: string;
  match: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {company} · {district}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {match}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">{salary}</span>
        <span className="text-sm font-medium text-blue-600">подходит</span>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,0.35),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Локальная платформа занятости
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
              Работа рядом с домом в Мангистау
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              MangystauJobs помогает молодым людям находить проверенные вакансии
              рядом, а малому бизнесу — быстрее находить подходящих кандидатов.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                Найти работу
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/employer"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Разместить вакансию
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/30 px-6 py-3 text-base font-semibold text-blue-200 transition hover:bg-blue-500/10"
              >
                <Sparkles className="h-4 w-4" />
                Умный подбор
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <StatCard value="120+" label="вакансий" />
              <StatCard value="45+" label="компаний" />
              <StatCard value="300+" label="кандидатов" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-sm font-semibold">Вакансии рядом</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Актау · предложения из базы
                  </div>
                </div>

                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  live
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <JobPreviewCard
                  title="Официант / Официантка"
                  company="Кафе «Каспий»"
                  district="Микрорайон 7"
                  salary="90 000–130 000 ₸"
                  match="92%"
                />

                <JobPreviewCard
                  title="Курьер-доставщик"
                  company="Caspian Logistics"
                  district="Микрорайон 12"
                  salary="80 000–150 000 ₸"
                  match="87%"
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Карта районов</span>
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="relative h-36 overflow-hidden rounded-xl bg-blue-50">
                    <div className="absolute left-8 top-8 h-3 w-3 rounded-full bg-blue-600 ring-8 ring-blue-600/15" />
                    <div className="absolute right-8 top-16 h-3 w-3 rounded-full bg-emerald-500 ring-8 ring-emerald-500/15" />
                    <div className="absolute bottom-8 left-1/2 h-3 w-3 rounded-full bg-amber-500 ring-8 ring-amber-500/15" />
                    <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-blue-200" />
                    <div className="absolute inset-y-6 left-1/2 border-l border-dashed border-blue-200" />
                    <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                      Микрорайоны Актау
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold">
                    Умный подбор
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Система сравнивает вакансию и кандидата по навыкам, району,
                    опыту, графику и зарплате.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role selection */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-2 lg:px-8">
          <Link
            href="/candidate"
            className="group rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  Для соискателей
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  Найти работу рядом
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Создай профиль, выбери район и получай подходящие вакансии в
                  Актау и Мангистауской области.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-blue-600">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          <Link
            href="/employer"
            className="group rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Для работодателей
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  Разместить вакансию
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Опубликуй вакансию, получай отклики и смотри кандидатов,
                  которым работа подходит по району, навыкам и графику.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-blue-600">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Проблема
          </div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Локальная работа есть, но её трудно увидеть
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Мы превращаем разрозненные объявления в понятную платформу для
            молодёжи и малого бизнеса.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-950">
                {problem.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Как работает
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              От профиля до отклика — за несколько минут
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-7 text-xl font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Возможности
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              Сервис для поиска и найма
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Платформа объединяет вакансии, карту, отклики, кабинет
              работодателя и умный подбор в одном месте.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl bg-slate-50 p-7">
            <ShieldCheck className="h-7 w-7 text-blue-600" />
            <h3 className="mt-5 text-xl font-semibold text-slate-950">
              Проверенные объявления
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Платформа может поддерживать модерацию вакансий, чтобы снижать
              риск фейковых предложений.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-7">
            <Clock className="h-7 w-7 text-blue-600" />
            <h3 className="mt-5 text-xl font-semibold text-slate-950">
              Быстрый отклик
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Кандидат отправляет заявку онлайн, а работодатель сразу видит её
              в своём кабинете.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-7">
            <Navigation className="h-7 w-7 text-blue-600" />
            <h3 className="mt-5 text-xl font-semibold text-slate-950">
              Работа ближе
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Локация учитывается при поиске и подборе, потому что дорога до
              работы важна для молодых людей.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-14 text-center text-white shadow-2xl lg:px-16">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight">
            Начни поиск или найм за несколько минут
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Создай профиль, найди вакансии на карте или размести объявление для
            кандидатов рядом.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/candidate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-950 shadow-sm"
            >
              Создать профиль
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/employer"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
            >
              Разместить вакансию
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}