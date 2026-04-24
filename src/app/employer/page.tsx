"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
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

const JobMap = dynamic(
  () =>
    import("@/components/map/JobMap").then(
      (mod: any) => mod.JobMap || mod.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаем карту вакансий...
        </div>
      </div>
    ),
  }
) as ComponentType<{ jobs: Job[]; height?: string; className?: string }>;

const sectors = [
  "Доставка",
  "Логистика",
  "Общественное питание",
  "Сервис",
  "Продажи",
  "Образование",
  "Розница",
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
  "Актау",
];

const employmentTypes = [
  { value: "FULL_TIME", label: "Полная занятость" },
  { value: "PART_TIME", label: "Подработка" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "CONTRACT", label: "Контракт" },
  { value: "SEASONAL", label: "Сезонная работа" },
];

const experienceLevels = [
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
  "Казахский язык",
  "Русский язык",
  "Английский язык",
  "Физическая выносливость",
  "Кассовый аппарат",
  "MS Office",
  "Водительские права кат. B",
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

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["data", "employers", "jobs", ...keys]) {
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
    // comma separated fallback
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

function getJobAge(createdAt?: string) {
  if (!createdAt) return "недавно";

  const diffHours = Math.max(
    1,
    Math.round((Date.now() - new Date(createdAt).getTime()) / 1000 / 60 / 60)
  );

  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${Math.round(diffHours / 24)} дн. назад`;
}

export default function EmployerPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedEmployerId, setSelectedEmployerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    sector: "Общественное питание",
    employmentType: "FULL_TIME",
    experienceLevel: "NO_EXPERIENCE",
    city: "Актау",
    district: "Микрорайон 7",
    salaryMin: "",
    salaryMax: "",
    customSkill: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Ответственность",
    "Пунктуальность",
  ]);

  const selectedEmployer = useMemo(
    () => employers.find((employer) => employer.id === selectedEmployerId),
    [employers, selectedEmployerId]
  );

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.isActive !== false),
    [jobs]
  );

  const totalApplications = useMemo(
    () =>
      jobs.reduce(
        (sum, job) => sum + Number(job._count?.applications || 0),
        0
      ),
    [jobs]
  );

  useEffect(() => {
    loadEmployers();
  }, []);

  useEffect(() => {
    if (selectedEmployerId) {
      loadJobs(selectedEmployerId);
    }
  }, [selectedEmployerId]);

  async function loadEmployers() {
    setLoading(true);

    try {
      const res = await fetch("/api/employers");
      const data = await res.json();
      const list = extractArray<Employer>(data, ["employers"]);

      setEmployers(list);

      if (list[0]?.id) {
        setSelectedEmployerId(list[0].id);
      }
    } catch {
      setMessage({
        type: "error",
        text: "Не удалось загрузить работодателей.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs(employerId: string) {
    setJobsLoading(true);

    try {
      const res = await fetch(`/api/jobs?employerId=${employerId}`);
      const data = await res.json();
      const list = extractArray<Job>(data, ["jobs"]);

      setJobs(list);
    } catch {
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill]
    );
  }

  function addCustomSkill() {
    const skill = form.customSkill.trim();

    if (!skill) return;

    if (!selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => [...prev, skill]);
    }

    updateForm("customSkill", "");
  }

  async function createJob() {
    if (!selectedEmployerId) {
      setMessage({
        type: "error",
        text: "Сначала выберите компанию.",
      });
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setMessage({
        type: "error",
        text: "Заполните название и описание вакансии.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        employerId: selectedEmployerId,
        title: form.title.trim(),
        description: form.description.trim(),
        sector: form.sector,
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        city: form.city,
        district: form.district,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        skills: selectedSkills.join(", "),
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || data.message || "Не удалось создать вакансию.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Вакансия создана. Теперь кандидаты смогут откликнуться.",
      });

      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        salaryMin: "",
        salaryMax: "",
      }));

      await loadJobs(selectedEmployerId);
    } catch {
      setMessage({
        type: "error",
        text: "Ошибка соединения. Попробуйте ещё раз.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                <Building2 className="h-4 w-4" />
                Кабинет работодателя
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Разместите вакансию и получите отклики
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Создавайте вакансии для локального рынка, смотрите отклики и
                находите кандидатов через умный подбор.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
              <MetricCard label="Вакансий" value={jobs.length} />
              <MetricCard label="Активных" value={activeJobs.length} />
              <MetricCard label="Откликов" value={totalApplications} />
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Проверка помогает снижать риск фейковых вакансий
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Для полноценной версии можно добавить модерацию работодателей
                    и объявлений: pending, approved, rejected.
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

      {/* Main content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr] lg:px-8">
        {/* Form */}
        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Новая вакансия
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Заполните данные для публикации
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Компания
              </span>
              <select
                value={selectedEmployerId}
                onChange={(e) => setSelectedEmployerId(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              >
                {employers.map((employer) => (
                  <option key={employer.id} value={employer.id}>
                    {employer.companyName}
                  </option>
                ))}
              </select>
            </label>

            {selectedEmployer && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-950">
                      {selectedEmployer.companyName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {selectedEmployer.businessType || "Малый бизнес"} ·{" "}
                      {selectedEmployer.city || "Актау"}
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Проверено
                  </span>
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Название вакансии
              </span>
              <input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Официант, курьер, продавец..."
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Описание
              </span>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={5}
                placeholder="Опишите обязанности, график, условия и требования..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Сфера
                </span>
                <select
                  value={form.sector}
                  onChange={(e) => updateForm("sector", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Район
                </span>
                <select
                  value={form.district}
                  onChange={(e) => updateForm("district", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Тип занятости
                </span>
                <select
                  value={form.employmentType}
                  onChange={(e) => updateForm("employmentType", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {employmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Опыт
                </span>
                <select
                  value={form.experienceLevel}
                  onChange={(e) =>
                    updateForm("experienceLevel", e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Зарплата от
                </span>
                <input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => updateForm("salaryMin", e.target.value)}
                  placeholder="90000"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Зарплата до
                </span>
                <input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => updateForm("salaryMax", e.target.value)}
                  placeholder="150000"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">
                Навыки и требования
              </span>

              <div className="mt-3 flex flex-wrap gap-2">
                {skillOptions.map((skill) => {
                  const active = selectedSkills.includes(skill);

                  return (
                    <button
                      key={skill}
                      type="button"
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

              <div className="mt-3 flex gap-2">
                <input
                  value={form.customSkill}
                  onChange={(e) => updateForm("customSkill", e.target.value)}
                  placeholder="Добавить свой навык"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

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
              onClick={createJob}
              disabled={submitting || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Публикуем...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Опубликовать вакансию
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Jobs */}
        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Вакансии компании
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Управляйте объявлениями и запускайте подбор кандидатов.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowMap((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? "Скрыть карту" : "Показать карту"}
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Отклики
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {showMap && jobs.length > 0 && (
            <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <JobMap jobs={jobs} height="380px" />
            </div>
          )}

          {jobsLoading ? (
            <div className="flex h-80 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем вакансии...
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
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
            <div className="space-y-5">
              {jobs.map((job) => (
                <EmployerJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
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

function EmployerJobCard({ job }: { job: Job }) {
  const skills = parseSkills(job.skills).slice(0, 5);

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
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}, {job.district}
            </span>
            <span>{getJobAge(job.createdAt)}</span>
            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
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
            <Link
              href={`/ai-match?jobId=${job.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              Найти кандидатов
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Users className="h-4 w-4" />
              Отклики
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}