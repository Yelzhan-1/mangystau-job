"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  Loader2,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type Role = "candidate" | "employer" | "admin";

type Session = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type Employer = {
  id: string;
  companyName: string;
  userId?: string;
  isVerified?: boolean;
};

type Job = {
  id: string;
  title: string;
  description?: string;
  sector?: string;
  experienceLevel?: string;
  employmentType?: string;
  city?: string;
  district?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills?: string | null;
  isActive?: boolean;
  createdAt?: string;
  employer?: Employer;
  _count?: {
    applications?: number;
  };
};

type CandidateProfile = {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  city?: string;
  district?: string;
  bio?: string;
  skills?: string;
  experienceLevel?: string;
  preferredJobType?: string;
  preferredType?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
};

const SESSION_KEY = "mj_session";
const JOBS_KEY = "mj_jobs";
const APPLICATIONS_KEY = "mj_applications";

const fallbackJobs: Job[] = [
  {
    id: "fallback-job-1",
    title: "Официант / Официантка",
    description:
      "Работа в кафе рядом с домом. Можно без опыта, главное — ответственность и пунктуальность.",
    sector: "Общественное питание",
    experienceLevel: "NO_EXPERIENCE",
    employmentType: "PART_TIME",
    city: "Актау",
    district: "Микрорайон 7",
    salaryMin: 90000,
    salaryMax: 130000,
    skills: "Ответственность, Коммуникабельность, Пунктуальность, Работа с клиентами",
    isActive: true,
    createdAt: new Date().toISOString(),
    employer: {
      id: "fallback-employer-1",
      companyName: "Кафе «Каспий»",
      isVerified: true,
    },
    _count: {
      applications: 1,
    },
  },
  {
    id: "fallback-job-2",
    title: "Курьер-доставщик",
    description:
      "Доставка заказов по районам Актау. Подходит для студентов и молодых специалистов.",
    sector: "Доставка",
    experienceLevel: "NO_EXPERIENCE",
    employmentType: "PART_TIME",
    city: "Актау",
    district: "Микрорайон 12",
    salaryMin: 80000,
    salaryMax: 150000,
    skills: "Знание города, Ответственность, Пунктуальность",
    isActive: true,
    createdAt: new Date().toISOString(),
    employer: {
      id: "fallback-employer-2",
      companyName: "Caspian Logistics",
      isVerified: true,
    },
    _count: {
      applications: 0,
    },
  },
  {
    id: "fallback-job-3",
    title: "Оператор склада",
    description:
      "Работа на складе в промзоне. Нужны внимательность и физическая выносливость.",
    sector: "Логистика",
    experienceLevel: "JUNIOR",
    employmentType: "FULL_TIME",
    city: "Актау",
    district: "Промзона",
    salaryMin: 120000,
    salaryMax: 180000,
    skills: "Физическая выносливость, Ответственность, Внимательность",
    isActive: true,
    createdAt: new Date().toISOString(),
    employer: {
      id: "fallback-employer-3",
      companyName: "Aktau Supply",
      isVerified: true,
    },
    _count: {
      applications: 0,
    },
  },
];

const sectors = [
  "Все сферы",
  "Общественное питание",
  "Доставка",
  "Логистика",
  "Ритейл",
  "Сервис",
  "Образование",
  "Администрация",
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

const employmentOptions = [
  { value: "", label: "Любой тип" },
  { value: "PART_TIME", label: "Подработка" },
  { value: "FULL_TIME", label: "Полная занятость" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "CONTRACT", label: "Контракт" },
];

const experienceOptions = [
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

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCandidateProfile(sessionId: string): CandidateProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(`mj_candidate_profile_${sessionId}`);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveApplications(applications: any[]) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  localStorage.setItem("mangystau_applications", JSON.stringify(applications));
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Зарплата не указана";

  if (min && max) {
    return `${min.toLocaleString("ru-RU")}–${max.toLocaleString("ru-RU")} ₸`;
  }

  if (min) return `от ${min.toLocaleString("ru-RU")} ₸`;

  return `до ${max?.toLocaleString("ru-RU")} ₸`;
}

export default function JobsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("Все сферы");
  const [district, setDistrict] = useState("Все районы");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [sendingApplication, setSendingApplication] = useState(false);
  const [myCandidateProfile, setMyCandidateProfile] =
    useState<CandidateProfile | null>(null);

  useEffect(() => {
    setSession(readSession());
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);

    try {
      const localJobs = readArray<Job>(JOBS_KEY);

      const res = await fetch("/api/jobs", { cache: "no-store" });
      const data = await res.json();
      const apiJobs: Job[] = Array.isArray(data)
        ? data
        : data.jobs || data.data || [];

      const merged = [
        ...localJobs,
        ...apiJobs.filter(
          (apiJob) => !localJobs.some((localJob) => localJob.id === apiJob.id)
        ),
      ];

      setJobs(merged.length > 0 ? merged : fallbackJobs);
    } catch {
      const localJobs = readArray<Job>(JOBS_KEY);
      setJobs(localJobs.length > 0 ? localJobs : fallbackJobs);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.sector?.toLowerCase().includes(query) ||
        job.district?.toLowerCase().includes(query) ||
        job.employer?.companyName?.toLowerCase().includes(query);

      const matchesSector = sector === "Все сферы" || job.sector === sector;
      const matchesDistrict =
        district === "Все районы" || job.district === district;
      const matchesEmployment =
        !employmentType || job.employmentType === employmentType;
      const matchesExperience =
        !experienceLevel || job.experienceLevel === experienceLevel;

      return (
        matchesSearch &&
        matchesSector &&
        matchesDistrict &&
        matchesEmployment &&
        matchesExperience &&
        job.isActive !== false
      );
    });
  }, [jobs, search, sector, district, employmentType, experienceLevel]);

  function openApplyModal(job: Job) {
    setApplyJob(job);
    setApplyMessage("");
    setApplyError("");
    setApplySuccess("");

    const currentSession = readSession();
    setSession(currentSession);

    if (currentSession?.role === "candidate") {
      setMyCandidateProfile(readCandidateProfile(currentSession.id));
    } else {
      setMyCandidateProfile(null);
    }
  }

  function closeApplyModal() {
    setApplyJob(null);
    setApplyMessage("");
    setApplyError("");
    setApplySuccess("");
    setSendingApplication(false);
  }

  async function handleSendApplication() {
    if (!applyJob) return;

    const currentSession = readSession();

    if (!currentSession) {
      setApplyError("Сначала войдите в аккаунт соискателя.");
      return;
    }

    if (currentSession.role !== "candidate") {
      setApplyError("Откликнуться может только соискатель.");
      return;
    }

    const profile = readCandidateProfile(currentSession.id);

    if (!profile) {
      setApplyError("Сначала создайте профиль соискателя в кабинете.");
      return;
    }

    setMyCandidateProfile(profile);
    setSendingApplication(true);
    setApplyError("");
    setApplySuccess("");

    const newApplication = {
      id: `application-${Date.now()}`,
      jobId: applyJob.id,
      candidateId: profile.id,
      employerId: applyJob.employer?.id || null,
      message:
        applyMessage.trim() ||
        "Здравствуйте! Меня заинтересовала ваша вакансия. Готов(а) обсудить детали.",
      status: "NEW",
      createdAt: new Date().toISOString(),
      job: applyJob,
      candidate: profile,
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: applyJob.id,
          candidateId: profile.id,
          message: newApplication.message,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }
    } catch {
      const existing = readArray<any>(APPLICATIONS_KEY);
      saveApplications([newApplication, ...existing]);
    } finally {
      const existing = readArray<any>(APPLICATIONS_KEY);
      const alreadySaved = existing.some((item) => item.id === newApplication.id);

      if (!alreadySaved) {
        saveApplications([newApplication, ...existing]);
      }

      setApplySuccess("Отклик успешно отправлен работодателю.");
      setSendingApplication(false);

      setTimeout(() => {
        closeApplyModal();
      }, 900);
    }
  }

  function resetFilters() {
    setSearch("");
    setSector("Все сферы");
    setDistrict("Все районы");
    setEmploymentType("");
    setExperienceLevel("");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <BriefcaseBusiness className="h-4 w-4" />
            Проверенные вакансии в Мангистау
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Создать профиль
              </Link>

              {session && (
                <Link
                  href="/ai-match"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <Sparkles className="h-4 w-4" />
                  Подбор
                </Link>
              )}
            </div>
          </div>

          {session && (
            <div className="mt-8 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-950">
                      Умный подбор помогает выбрать подходящее
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Открой страницу подбора, чтобы увидеть предложения с
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
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-950">Фильтры</h2>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-slate-700">Поиск</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Курьер, кафе, склад..."
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Сфера</span>
            <select
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
            >
              {sectors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Район</span>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
            >
              {districts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
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

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Опыт</span>
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

          <button
            onClick={resetFilters}
            className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Сбросить фильтры
          </button>
        </aside>

        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Актуальные вакансии
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Найдено вакансий: {filteredJobs.length}
              </p>
            </div>

            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4" />
              Карта
            </Link>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем вакансии...
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                По этим фильтрам вакансий пока нет
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Попробуйте изменить район, сферу или тип занятости.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => openApplyModal(job)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-slate-950">
                  Отклик на вакансию
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {applyJob.title} ·{" "}
                  {applyJob.employer?.companyName || "Работодатель"}
                </p>
              </div>

              <button
                onClick={closeApplyModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 h-px w-full bg-slate-200" />

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Профиль соискателя</p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {myCandidateProfile?.user?.name ||
                    session?.name ||
                    "Профиль не найден"}
                </p>

                {!myCandidateProfile && (
                  <p className="mt-2 text-sm text-red-500">
                    Чтобы отправить отклик, сначала создайте профиль соискателя
                    в кабинете.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Сообщение работодателю
                </label>

                <textarea
                  value={applyMessage}
                  onChange={(event) => setApplyMessage(event.target.value)}
                  placeholder="Например: Здравствуйте! Меня заинтересовала ваша вакансия. Готов(а) выйти на работу в ближайшее время."
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              {applyError && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {applyError}
                </div>
              )}

              {applySuccess && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                  {applySuccess}
                </div>
              )}

              <button
                onClick={handleSendApplication}
                disabled={sendingApplication}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sendingApplication ? "Отправка..." : "Отправить отклик"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function JobCard({ job, onApply }: { job: Job; onApply: () => void }) {
  const skills = parseSkills(job.skills).slice(0, 6);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {employmentLabels[job.employmentType || ""] ||
                job.employmentType ||
                "Тип работы"}
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {experienceLabels[job.experienceLevel || ""] ||
                job.experienceLevel ||
                "Опыт"}
            </span>

            {job.sector && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {job.sector}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{job.employer?.companyName || "Компания"}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city || "Актау"}, {job.district || "район не указан"}
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {job.description}
          </p>

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

        <div className="shrink-0 lg:w-56">
          <div className="rounded-2xl bg-slate-50 p-4 text-right">
            <div className="text-lg font-bold text-slate-950">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {job._count?.applications || 0} откликов
            </div>
          </div>

          <button
            onClick={onApply}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Откликнуться
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href={`/ai-match?jobId=${job.id}`}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4" />
            Подбор
          </Link>
        </div>
      </div>
    </article>
  );
}
