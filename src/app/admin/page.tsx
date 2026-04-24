"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Employer = {
  id: string;
  companyName: string;
  businessType?: string | null;
  city?: string | null;
  district?: string | null;
  contactPhone?: string | null;
  description?: string | null;
  isVerified?: boolean;
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
  isActive?: boolean;
  createdAt?: string;
  employer?: Employer;
  _count?: {
    applications?: number;
  };
};

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

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["data", "jobs", "employers", ...keys]) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // fallback below
  }

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

function getDate(value?: string) {
  if (!value) return "недавно";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "employers">("jobs");

  const [jobStatusFilter, setJobStatusFilter] = useState("ALL");
  const [employerFilter, setEmployerFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const metrics = useMemo(() => {
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => job.isActive !== false).length,
      hiddenJobs: jobs.filter((job) => job.isActive === false).length,
      verifiedEmployers: employers.filter((employer) => employer.isVerified)
        .length,
    };
  }, [jobs, employers]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus =
        jobStatusFilter === "ALL" ||
        (jobStatusFilter === "ACTIVE" && job.isActive !== false) ||
        (jobStatusFilter === "HIDDEN" && job.isActive === false);

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.sector.toLowerCase().includes(query) ||
        job.district.toLowerCase().includes(query) ||
        job.employer?.companyName?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [jobs, jobStatusFilter, search]);

  const filteredEmployers = useMemo(() => {
    return employers.filter((employer) => {
      const matchesStatus =
        employerFilter === "ALL" ||
        (employerFilter === "VERIFIED" && employer.isVerified) ||
        (employerFilter === "UNVERIFIED" && !employer.isVerified);

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        employer.companyName.toLowerCase().includes(query) ||
        employer.businessType?.toLowerCase().includes(query) ||
        employer.city?.toLowerCase().includes(query) ||
        employer.district?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [employers, employerFilter, search]);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    setMessage(null);

    try {
      const [jobsRes, employersRes] = await Promise.all([
        fetch("/api/admin/jobs"),
        fetch("/api/employers"),
      ]);

      const [jobsData, employersData] = await Promise.all([
        jobsRes.json(),
        employersRes.json(),
      ]);

      setJobs(extractArray<Job>(jobsData, ["jobs"]));
      setEmployers(extractArray<Employer>(employersData, ["employers"]));
    } catch {
      setMessage({
        type: "error",
        text: "Не удалось загрузить данные модерации.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateJobStatus(jobId: string, isActive: boolean) {
    setUpdatingId(jobId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || data.message || "Не удалось обновить вакансию.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Статус вакансии обновлён.",
      });

      await loadAdminData();
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка соединения. Попробуйте ещё раз.",
      });
    } finally {
      setUpdatingId("");
    }
  }

  async function updateEmployerStatus(employerId: string, isVerified: boolean) {
    setUpdatingId(employerId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/employers/${employerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text:
            data.error ||
            data.message ||
            "Не удалось обновить работодателя.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Статус работодателя обновлён.",
      });

      await loadAdminData();
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка соединения. Попробуйте ещё раз.",
      });
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4" />
                Admin moderation
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Проверка работодателей и вакансий
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Модерация помогает сделать платформу безопаснее: админ может
                скрывать сомнительные вакансии и отмечать проверенные компании.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 lg:w-[560px]">
              <MetricCard label="Вакансий" value={metrics.totalJobs} />
              <MetricCard label="Активных" value={metrics.activeJobs} />
              <MetricCard label="Скрытых" value={metrics.hiddenJobs} />
              <MetricCard
                label="Проверенных"
                value={metrics.verifiedEmployers}
              />
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <BadgeCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Почему это важно для реального продукта
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Молодёжь должна видеть только понятные и безопасные
                    предложения. Поэтому админ-контроль повышает доверие к
                    платформе.
                  </p>
                </div>
              </div>

              <Link
                href="/jobs"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
              >
                Смотреть публичные вакансии
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid rounded-[1.25rem] bg-slate-100 p-1 sm:grid-cols-2">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "jobs"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                Вакансии
              </button>

              <button
                onClick={() => setActiveTab("employers")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "employers"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                Работодатели
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск..."
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-64"
                />
              </div>

              {activeTab === "jobs" ? (
                <select
                  value={jobStatusFilter}
                  onChange={(event) => setJobStatusFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  <option value="ALL">Все вакансии</option>
                  <option value="ACTIVE">Опубликованные</option>
                  <option value="HIDDEN">Скрытые</option>
                </select>
              ) : (
                <select
                  value={employerFilter}
                  onChange={(event) => setEmployerFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  <option value="ALL">Все работодатели</option>
                  <option value="VERIFIED">Проверенные</option>
                  <option value="UNVERIFIED">Не проверенные</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-5 rounded-xl p-4 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex h-80 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Загружаем данные модерации...
            </div>
          </div>
        ) : activeTab === "jobs" ? (
          filteredJobs.length === 0 ? (
            <EmptyState
              title="Вакансий не найдено"
              text="Попробуйте изменить фильтр или поисковый запрос."
            />
          ) : (
            <div className="space-y-5">
              {filteredJobs.map((job) => (
                <AdminJobCard
                  key={job.id}
                  job={job}
                  updating={updatingId === job.id}
                  onToggle={(isActive) => updateJobStatus(job.id, isActive)}
                />
              ))}
            </div>
          )
        ) : filteredEmployers.length === 0 ? (
          <EmptyState
            title="Работодателей не найдено"
            text="Попробуйте изменить фильтр или поисковый запрос."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredEmployers.map((employer) => (
              <AdminEmployerCard
                key={employer.id}
                employer={employer}
                updating={updatingId === employer.id}
                onToggle={(isVerified) =>
                  updateEmployerStatus(employer.id, isVerified)
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function AdminJobCard({
  job,
  updating,
  onToggle,
}: {
  job: Job;
  updating: boolean;
  onToggle: (isActive: boolean) => void;
}) {
  const skills = parseSkills(job.skills).slice(0, 5);
  const isPublished = job.isActive !== false;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isPublished
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {isPublished ? "Опубликована" : "Скрыта"}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {employmentLabels[job.employmentType] || job.employmentType}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
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
            <span className="font-medium text-slate-700">
              {job.employer?.companyName || "Компания"}
            </span>

            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}, {job.district}
            </span>

            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            <span>{getDate(job.createdAt)}</span>
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
          <div className="rounded-2xl bg-slate-50 p-4 text-left lg:text-right">
            <div className="text-lg font-bold text-slate-950">
              {job._count?.applications || 0}
            </div>
            <div className="mt-1 text-xs text-slate-500">откликов</div>
          </div>

          <div className="mt-3 grid gap-2">
            {isPublished ? (
              <button
                onClick={() => onToggle(false)}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                Скрыть
              </button>
            ) : (
              <button
                onClick={() => onToggle(true)}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Опубликовать
              </button>
            )}

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

function AdminEmployerCard({
  employer,
  updating,
  onToggle,
}: {
  employer: Employer;
  updating: boolean;
  onToggle: (isVerified: boolean) => void;
}) {
  const verified = Boolean(employer.isVerified);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                verified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {verified ? "Проверен" : "Не проверен"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {employer.businessType || "Малый бизнес"}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {employer.companyName}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {employer.city || "Актау"},{" "}
              {employer.district || "район не указан"}
            </span>

            <span>{employer.contactPhone || employer.user?.phone}</span>
            <span>{employer.user?.email}</span>
          </div>

          {employer.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {employer.description}
            </p>
          )}
        </div>

        <div className="shrink-0 sm:w-52">
          {verified ? (
            <button
              onClick={() => onToggle(false)}
              disabled={updating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Снять проверку
            </button>
          ) : (
            <button
              onClick={() => onToggle(true)}
              disabled={updating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Подтвердить
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <h3 className="mt-6 text-xl font-semibold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}