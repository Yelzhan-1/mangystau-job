"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";

type Session = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  createdAt: string;
};

type Job = {
  id: string;
  title: string;
  description: string;
  sector: string;
  experienceLevel: string;
  employmentType: string;
  city: string;
  district: string;
  salaryMin: number;
  salaryMax: number;
  skills: string;
  isActive: boolean;
  createdAt: string;
  employer: {
    id: string;
    companyName: string;
    userId: string;
    isVerified: boolean;
  };
  _count?: {
    applications: number;
  };
};

const SESSION_KEY = "mj_session";
const JOBS_KEY = "mj_jobs";

const sectors = [
  "Общественное питание",
  "Доставка",
  "Логистика",
  "Ритейл",
  "Сервис",
  "Образование",
  "Администрация",
];

const districts = [
  "Микрорайон 1",
  "Микрорайон 5",
  "Микрорайон 7",
  "Микрорайон 12",
  "Микрорайон 27",
  "Промзона",
  "Центр",
];

const employmentOptions = [
  { value: "PART_TIME", label: "Подработка" },
  { value: "FULL_TIME", label: "Полная занятость" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "CONTRACT", label: "Контракт" },
];

const experienceOptions = [
  { value: "NO_EXPERIENCE", label: "Без опыта" },
  { value: "JUNIOR", label: "Начинающий" },
  { value: "MIDDLE", label: "Средний опыт" },
  { value: "SENIOR", label: "Опытный" },
];

const skillOptions = [
  "Ответственность",
  "Коммуникабельность",
  "Пунктуальность",
  "Работа в команде",
  "Знание города",
  "Кассовый аппарат",
  "Работа с клиентами",
  "Физическая выносливость",
  "Водительские права кат. B",
  "Санитарные нормы",
];

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

function readJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: Job[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function formatSalary(min: number, max: number) {
  return `${min.toLocaleString("ru-RU")}–${max.toLocaleString("ru-RU")} ₸`;
}

export default function EmployerPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [jobs, setJobs] = useState<Job[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("Общественное питание");
  const [district, setDistrict] = useState("Микрорайон 7");
  const [employmentType, setEmploymentType] = useState("PART_TIME");
  const [experienceLevel, setExperienceLevel] = useState("NO_EXPERIENCE");
  const [salaryMin, setSalaryMin] = useState("90000");
  const [salaryMax, setSalaryMax] = useState("150000");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Ответственность",
    "Пунктуальность",
  ]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const current = readSession();

    if (!current) {
      window.location.href = "/login?mode=login";
      return;
    }

    if (current.role !== "employer") {
      window.location.href = "/account";
      return;
    }

    setSession(current);

    const allJobs = readJobs();
    setJobs(
      allJobs.filter((job) => job.employer?.userId === current.id)
    );

    setChecking(false);
  }, []);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter((job) => job.isActive).length,
      applications: jobs.reduce(
        (sum, job) => sum + (job._count?.applications || 0),
        0
      ),
    };
  }, [jobs]);

  function toggleSkill(skill: string) {
    setSelectedSkills((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return [...current, skill];
    });
  }

  function createJob() {
    setError("");
    setSuccess("");

    if (!session) {
      setError("Сначала войдите в аккаунт работодателя.");
      return;
    }

    if (!title.trim()) {
      setError("Введите название вакансии.");
      return;
    }

    if (!description.trim()) {
      setError("Введите описание вакансии.");
      return;
    }

    const min = Number(salaryMin);
    const max = Number(salaryMax);

    if (!min || !max || min > max) {
      setError("Проверьте диапазон зарплаты.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Выберите хотя бы один навык.");
      return;
    }

    const newJob: Job = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      sector,
      experienceLevel,
      employmentType,
      city: "Актау",
      district,
      salaryMin: min,
      salaryMax: max,
      skills: selectedSkills.join(", "),
      isActive: true,
      createdAt: new Date().toISOString(),
      employer: {
        id: `employer-${session.id}`,
        companyName: session.name,
        userId: session.id,
        isVerified: false,
      },
      _count: {
        applications: 0,
      },
    };

    const allJobs = readJobs();
    saveJobs([newJob, ...allJobs]);

    const updatedCompanyJobs = [newJob, ...jobs];
    setJobs(updatedCompanyJobs);

    setTitle("");
    setDescription("");
    setSalaryMin("90000");
    setSalaryMax("150000");
    setSelectedSkills(["Ответственность", "Пунктуальность"]);

    setSuccess("Вакансия создана. Она сохранена и будет доступна на сайте.");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем кабинет работодателя...
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <Building2 className="h-4 w-4" />
            Кабинет работодателя
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Разместите вакансию и получите отклики
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Компания: <span className="font-semibold text-slate-950">{session.name}</span>.
                Создавайте вакансии, смотрите отклики и находите кандидатов через подбор.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:w-[420px]">
              <Stat label="Вакансий" value={stats.total} />
              <Stat label="Активных" value={stats.active} />
              <Stat label="Откликов" value={stats.applications} />
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Компания берётся из вашего аккаунта
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Больше не нужно выбирать компанию из списка. Все вакансии
                    автоматически привязаны к работодателю, который вошёл в аккаунт.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
              >
                Смотреть отклики
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr] lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Plus className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Новая вакансия
          </h2>

          <div className="mt-6 grid gap-4">
            <label>
              <span className="text-sm font-medium text-slate-700">
                Компания
              </span>
              <input
                value={session.name}
                disabled
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">
                Название вакансии
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Официант, курьер, продавец..."
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">
                Описание
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Опишите обязанности, график, условия работы..."
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Сфера
                </span>
                <select
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {sectors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Район
                </span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Тип занятости
                </span>
                <select
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {employmentOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Опыт
                </span>
                <select
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {experienceOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Зарплата от
                </span>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(event) => setSalaryMin(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Зарплата до
                </span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(event) => setSalaryMax(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700">
                Навыки и требования
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {skillOptions.map((skill) => {
                  const active = selectedSkills.includes(skill);

                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <button
              onClick={createJob}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Опубликовать вакансию
            </button>
          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Вакансии компании
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Управляйте объявлениями и запускайте подбор кандидатов.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4" />
                Карта
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Отклики
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                У этой компании пока нет вакансий
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Создайте первую вакансию, чтобы кандидаты смогли откликнуться.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {job.employmentType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {job.sector}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                        {job.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>{session.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Актау, {job.district}
                        </span>
                      </div>

                      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                        {job.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {job.skills.split(",").map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 lg:w-56">
                      <div className="rounded-2xl bg-slate-50 p-4 text-right">
                        <div className="text-lg font-bold text-slate-950">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {job._count?.applications || 0} откликов
                        </div>
                      </div>

                      <Link
                        href={`/ai-match?jobId=${job.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        Найти кандидатов
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}