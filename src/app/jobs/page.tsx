"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  Layers,
  Loader2,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type Employer = {
  id: string;
  companyName: string;
  businessType?: string | null;
  city?: string | null;
  district?: string | null;
  user?: User;
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
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills: string;
  createdAt?: string;
  isActive?: boolean;
  employer?: Employer;
  _count?: {
    applications?: number;
  };
};

type Candidate = {
  id: string;
  userId?: string;
  city?: string;
  district?: string;
  skills?: string;
  experienceLevel?: string;
  preferredJobType?: string;
  preferredType?: string;
  user?: User;
};

const JobMap = dynamic(
  () =>
    import("@/components/map/JobMap").then((mod: any) => mod.JobMap || mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[460px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем карту вакансий...
        </div>
      </div>
    ),
  }
) as ComponentType<{ jobs: Job[]; height?: string; className?: string }>;

const sectors = [
  "Все сферы",
  "Доставка",
  "Логистика",
  "Общественное питание",
  "Сервис",
  "Продажи",
  "Образование",
];

const districts = [
  "Все районы",
  "Микрорайон 1",
  "Микрорайон 5",
  "Микрорайон 7",
  "Микрорайон 12",
  "Микрорайон 27",
  "Промзона",
  "Центр",
];

const employmentTypes = [
  { value: "", label: "Любой тип" },
  { value: "FULL_TIME", label: "Полная занятость" },
  { value: "PART_TIME", label: "Подработка" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "CONTRACT", label: "Контракт" },
  { value: "SEASONAL", label: "Сезонная работа" },
];

const experienceLevels = [
  { value: "", label: "Любой опыт" },
  { value: "NO_EXPERIENCE", label: "Без опыта" },
  { value: "JUNIOR", label: "Начинающий" },
  { value: "MIDDLE", label: "Средний опыт" },
  { value: "SENIOR", label: "Опытный" },
];

const employmentLabels: Record<string, string> = {
  FULL_TIME: "Полная занятость",
  PART_TIME: "Подработка",
  INTERNSHIP: "Стажировка",
  CONTRACT: "Контракт",
  SEASONAL: "Сезонная работа",
};

const experienceLabels: Record<string, string> = {
  NO_EXPERIENCE: "Без опыта",
  JUNIOR: "Начинающий",
  MIDDLE: "Средний опыт",
  SENIOR: "Опытный",
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Зарплата не указана";
  if (min && max) return `${min.toLocaleString("ru-RU")}–${max.toLocaleString("ru-RU")} ₸`;
  if (min) return `от ${min.toLocaleString("ru-RU")} ₸`;
  return `до ${max?.toLocaleString("ru-RU")} ₸`;
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // comma string
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCompanyName(job: Job) {
  return job.employer?.companyName || "Компания";
}

function getJobAge(createdAt?: string) {
  if (!createdAt) return "обновлено недавно";

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffHours = Math.max(1, Math.round((now - created) / 1000 / 60 / 60));

  if (diffHours < 24) return `${diffHours} ч назад`;
  const days = Math.round(diffHours / 24);
  return `${days} дн. назад`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [district, setDistrict] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "map") setView("map");
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sector, district, employmentType, experienceLevel]);

  async function fetchCandidates() {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.candidates || data.data || [];
      setCandidates(list);
      if (list[0]?.id) setSelectedCandidateId(list[0].id);
    } catch {
      setCandidates([]);
    }
  }

  async function fetchJobs() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (sector && sector !== "Все сферы") params.set("sector", sector);
      if (district && district !== "Все районы") params.set("district", district);
      if (employmentType) params.set("employmentType", employmentType);
      if (experienceLevel) params.set("experienceLevel", experienceLevel);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.jobs || data.data || [];

      setJobs(list);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setSector("");
    setDistrict("");
    setEmploymentType("");
    setExperienceLevel("");
  }

  async function submitApplication() {
    if (!selectedJob) return;

    if (!selectedCandidateId) {
      setMessage({
        type: "error",
        text: "Сначала выберите профиль соискателя.",
      });
      return;
    }

    setApplyLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          candidateId: selectedCandidateId,
          coverLetter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || data.message || "Не удалось отправить отклик.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Отклик отправлен работодателю.",
      });

      setCoverLetter("");
      await fetchJobs();
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка соединения. Попробуйте ещё раз.",
      });
    } finally {
      setApplyLoading(false);
    }
  }

  const activeFilterCount = useMemo(() => {
    return [search, sector, district, employmentType, experienceLevel].filter(Boolean).length;
  }, [search, sector, district, employmentType, experienceLevel]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <BriefcaseBusiness className="h-4 w-4" />
                Проверенные вакансии в Мангистау
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Найди работу рядом
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Фильтруй вакансии по району, сфере, графику и опыту. Смотри
                предложения списком или на карте Актау.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/candidate"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Создать профиль
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Sparkles className="h-4 w-4" />
                Умный подбор
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Умный подбор помогает не просто искать, а выбирать подходящее
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Открой страницу подбора, выбери профиль и получи вакансии с
                    объяснением по навыкам, району, опыту и зарплате.
                  </p>
                </div>
              </div>

              <Link
                href="/ai-match"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
              >
                Попробовать подбор
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr] lg:px-8">
        {/* Filters */}
        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">Фильтры</h2>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Сбросить
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Поиск</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Курьер, кафе, склад..."
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Сфера</span>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              >
                {sectors.map((item) => (
                  <option key={item} value={item === "Все сферы" ? "" : item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Район</span>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              >
                {districts.map((item) => (
                  <option key={item} value={item === "Все районы" ? "" : item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Тип занятости
              </span>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              >
                {employmentTypes.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Опыт</span>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              >
                {experienceLevels.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">
              Найдено вакансий
            </div>
            <div className="mt-1 text-3xl font-bold text-blue-600">
              {jobs.length}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Актуальные вакансии
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Данные загружаются из базы и обновляются после новых публикаций.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setView("list")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  view === "list"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="h-4 w-4" />
                Список
              </button>

              <button
                onClick={() => setView("map")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  view === "map"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Карта
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем вакансии...
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <SlidersHorizontal className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                По этим фильтрам вакансий пока нет
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Попробуйте изменить район, сферу или тип занятости.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : view === "map" ? (
            <div className="space-y-5">
              <JobMap jobs={jobs} height="520px" />

              <div className="grid gap-4 md:grid-cols-2">
                {jobs.slice(0, 4).map((job) => (
                  <JobListCard key={job.id} job={job} onApply={() => setSelectedJob(job)} compact />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {jobs.map((job) => (
                <JobListCard key={job.id} job={job} onApply={() => setSelectedJob(job)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Apply modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Отклик на вакансию
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedJob.title} · {getCompanyName(selectedJob)}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedJob(null);
                  setMessage(null);
                }}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Выберите профиль соискателя
                </span>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.user?.name || "Кандидат"} · {candidate.district || "район не указан"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Короткое сообщение работодателю
                </span>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Здравствуйте! Меня заинтересовала вакансия..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              {message && (
                <div
                  className={`rounded-xl p-4 text-sm font-medium ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                onClick={submitApplication}
                disabled={applyLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {applyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Отправить отклик
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function JobListCard({
  job,
  onApply,
  compact = false,
}: {
  job: Job;
  onApply: () => void;
  compact?: boolean;
}) {
  const skills = parseSkills(job.skills).slice(0, compact ? 3 : 5);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {employmentLabels[job.employmentType] || job.employmentType}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {experienceLabels[job.experienceLevel] || job.experienceLevel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {job.sector}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{getCompanyName(job)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}, {job.district}
            </span>
            <span>{getJobAge(job.createdAt)}</span>
          </div>

          {!compact && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {job.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 lg:w-52">
          <div className="rounded-2xl bg-slate-50 p-4 text-left lg:text-right">
            <div className="text-lg font-bold text-slate-950">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {job._count?.applications || 0} откликов
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <button
              onClick={onApply}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Откликнуться
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              href={`/ai-match?jobId=${job.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Sparkles className="h-4 w-4" />
              Подбор
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}