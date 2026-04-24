"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type Role = "candidate" | "employer" | "admin";

type Session = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const SESSION_KEY = "mj_session";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.email || !parsed?.role) return null;

    return parsed;
  } catch {
    return null;
  }
}

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const current = readSession();

    if (!current) {
      window.location.href = "/login?mode=login";
      return;
    }

    setSession(current);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Проверяем аккаунт...
        </div>
      </main>
    );
  }

  if (!session) return null;

  const isCandidate = session.role === "candidate";
  const isEmployer = session.role === "employer";
  const isAdmin = session.role === "admin";

  const title = isCandidate
    ? "Кабинет соискателя"
    : isEmployer
      ? "Кабинет работодателя"
      : "Панель администратора";

  const description = isCandidate
    ? "Здесь вы можете управлять профилем, открыть себя для работодателей, смотреть вакансии и запускать умный подбор."
    : isEmployer
      ? "Здесь вы можете размещать вакансии, смотреть отклики кандидатов, управлять заявками и запускать подбор работников."
      : "Здесь вы можете проверять работодателей, скрывать сомнительные вакансии и управлять безопасностью платформы.";

  const MainIcon = isCandidate ? UserRound : isEmployer ? Building2 : ShieldCheck;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <MainIcon className="h-4 w-4" />
            {title}
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Добро пожаловать, {session.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <MainIcon className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              Что можно сделать дальше
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {isCandidate && (
                <>
                  <ActionCard
                    title="Мой профиль"
                    text="Заполнить данные, район, навыки и формат работы."
                    href="/candidate"
                    button="Открыть профиль"
                  />
                  <ActionCard
                    title="Найти вакансии"
                    text="Смотреть актуальные предложения списком или на карте."
                    href="/jobs"
                    button="Смотреть вакансии"
                  />
                  <ActionCard
                    title="Умный подбор"
                    text="Получить вакансии, которые подходят по навыкам и району."
                    href="/ai-match"
                    button="Открыть подбор"
                  />
                  <ActionCard
                    title="Работники"
                    text="Проверить, как профиль выглядит для работодателя."
                    href="/workers"
                    button="Смотреть работников"
                  />
                </>
              )}

              {isEmployer && (
                <>
                  <ActionCard
                    title="Разместить вакансию"
                    text="Создать объявление для кандидатов в Мангистау."
                    href="/employer"
                    button="Создать вакансию"
                  />
                  <ActionCard
                    title="Отклики"
                    text="Смотреть кандидатов и менять статус заявки."
                    href="/dashboard"
                    button="Открыть отклики"
                  />
                  <ActionCard
                    title="Найти работников"
                    text="Просмотреть публичные профили соискателей."
                    href="/workers"
                    button="Смотреть работников"
                  />
                  <ActionCard
                    title="Подбор кандидатов"
                    text="Сравнить кандидатов с вакансией по критериям."
                    href="/ai-match"
                    button="Открыть подбор"
                  />
                </>
              )}

              {isAdmin && (
                <>
                  <ActionCard
                    title="Модерация"
                    text="Проверить работодателей и публикацию вакансий."
                    href="/admin"
                    button="Открыть админку"
                  />
                  <ActionCard
                    title="Публичные вакансии"
                    text="Проверить, что видят обычные пользователи."
                    href="/jobs"
                    button="Смотреть сайт"
                  />
                </>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              Данные аккаунта
            </h3>

            <div className="mt-5 space-y-4 text-sm">
              <InfoRow label="Имя" value={session.name} />
              <InfoRow label="Email" value={session.email} />
              <InfoRow
                label="Роль"
                value={
                  session.role === "candidate"
                    ? "Соискатель"
                    : session.role === "employer"
                      ? "Работодатель"
                      : "Администратор"
                }
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  title,
  text,
  href,
  button,
}: {
  title: string;
  text: string;
  href: string;
  button: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <Sparkles className="h-5 w-5 text-blue-600" />
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
      >
        {button}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}