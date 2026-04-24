"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
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
  user?: User;
};

type Candidate = {
  id: string;
  userId?: string;
  bio?: string | null;
  city?: string | null;
  district?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  preferredJobType?: string | null;
  preferredType?: string | null;
  user?: User;
};

type Job = {
  id: string;
  title: string;
  sector?: string | null;
  city?: string | null;
  district?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employerId?: string;
  employer?: Employer;
};

type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  coverLetter?: string | null;
  createdAt?: string;
  updatedAt?: string;
  job?: Job;
  candidate?: Candidate;
};

const statusOptions = [
  { value: "PENDING", label: "Новый" },
  { value: "VIEWED", label: "Просмотрен" },
  { value: "SHORTLISTED", label: "В шорт-листе" },
  { value: "REJECTED", label: "Отклонён" },
  { value: "HIRED", label: "Нанят" },
];

const statusLabels: Record<string, string> = {
  PENDING: "Новый",
  VIEWED: "Просмотрен",
  SHORTLISTED: "В шорт-листе",
  REJECTED: "Отклонён",
  HIRED: "Нанят",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  VIEWED: "bg-slate-100 text-slate-700 border-slate-200",
  SHORTLISTED: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const experienceLabels: Record<string, string> = {
  NO_EXPERIENCE: "Без опыта",
  JUNIOR: "Начинающий",
  MIDDLE: "Средний опыт",
  SENIOR: "Опытный",
};

const employmentLabels: Record<string, string> = {
  FULL_TIME: "Полная занятость",
  PART_TIME: "Подработка",
  INTERNSHIP: "Стажировка",
  CONTRACT: "Контракт",
  SEASONAL: "Сезонная работа",
};

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["data", "applications", "employers", ...keys]) {
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

function getCandidateName(application: Application) {
  return application.candidate?.user?.name || "Кандидат";
}

function getCandidateContact(application: Application) {
  const user = application.candidate?.user;

  return {
    phone: user?.phone || "Телефон не указан",
    email: user?.email || "Email не указан",
  };
}

function getJobTitle(application: Application) {
  return application.job?.title || "Вакансия";
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

function getPreferredType(candidate?: Candidate) {
  const value = candidate?.preferredJobType || candidate?.preferredType || "";
  return employmentLabels[value] || value || "Тип работы не указан";
}

export default function DashboardPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedEmployerId, setSelectedEmployerId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedEmployer = useMemo(
    () => employers.find((employer) => employer.id === selectedEmployerId),
    [employers, selectedEmployerId]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "ALL" || application.status === statusFilter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        getCandidateName(application).toLowerCase().includes(query) ||
        getJobTitle(application).toLowerCase().includes(query) ||
        application.candidate?.skills?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, search]);

  const metrics = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((item) => item.status === "PENDING").length,
      shortlisted: applications.filter((item) => item.status === "SHORTLISTED")
        .length,
      hired: applications.filter((item) => item.status === "HIRED").length,
    };
  }, [applications]);

  useEffect(() => {
    loadEmployers();
  }, []);

  useEffect(() => {
    if (selectedEmployerId) {
      loadApplications(selectedEmployerId);
    }
  }, [selectedEmployerId]);

  async function loadEmployers() {
    setLoadingEmployers(true);

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
      setLoadingEmployers(false);
    }
  }

  async function loadApplications(employerId: string) {
    setLoadingApplications(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/applications?employerId=${employerId}`);
      const data = await res.json();
      const list = extractArray<Application>(data, ["applications"]);

      setApplications(list);
    } catch {
      setApplications([]);
      setMessage({
        type: "error",
        text: "Не удалось загрузить отклики.",
      });
    } finally {
      setLoadingApplications(false);
    }
  }

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    setMessage(null);

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || data.message || "Не удалось обновить статус.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Статус отклика обновлён.",
      });

      if (selectedEmployerId) {
        await loadApplications(selectedEmployerId);
      }
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
                <BriefcaseBusiness className="h-4 w-4" />
                Кабинет работодателя
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Отклики и кандидаты
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Следите за заявками, меняйте статусы кандидатов и переходите к
                умному подбору для каждой вакансии.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 lg:w-[520px]">
              <MetricCard label="Всего" value={metrics.total} />
              <MetricCard label="Новые" value={metrics.pending} />
              <MetricCard label="Шорт-лист" value={metrics.shortlisted} />
              <MetricCard label="Наняты" value={metrics.hired} />
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
                    Управление откликами в одном месте
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    После отклика кандидата работодатель может просмотреть
                    профиль и обновить статус: новый, просмотрен, шорт-лист,
                    отклонён или нанят.
                  </p>
                </div>
              </div>

              <Link
                href="/ai-match"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
              >
                Открыть подбор
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Building2 className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Компания
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Выберите работодателя, чтобы увидеть отклики на его вакансии.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-slate-700">
              Работодатель
            </span>

            <select
              value={selectedEmployerId}
              onChange={(e) => setSelectedEmployerId(e.target.value)}
              disabled={loadingEmployers}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300 disabled:opacity-60"
            >
              {employers.map((employer) => (
                <option key={employer.id} value={employer.id}>
                  {employer.companyName}
                </option>
              ))}
            </select>
          </label>

          {selectedEmployer && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="font-semibold text-slate-950">
                {selectedEmployer.companyName}
              </div>

              <div className="mt-1 text-sm text-slate-500">
                {selectedEmployer.businessType || "Малый бизнес"}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {selectedEmployer.city || "Актау"},{" "}
                {selectedEmployer.district || "район не указан"}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Link
              href="/employer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Разместить вакансию
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/jobs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Смотреть вакансии
            </Link>
          </div>
        </aside>

        <div>
          <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Заявки кандидатов
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Фильтруйте отклики по статусу и быстро обновляйте этапы.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по кандидату..."
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  <option value="ALL">Все статусы</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
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

          {loadingApplications ? (
            <div className="flex h-80 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем отклики...
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Откликов пока нет
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Когда кандидаты откликнутся на вакансии выбранного работодателя,
                они появятся здесь.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  updating={updatingId === application.id}
                  onStatusChange={(status) =>
                    updateStatus(application.id, status)
                  }
                />
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

function ApplicationCard({
  application,
  updating,
  onStatusChange,
}: {
  application: Application;
  updating: boolean;
  onStatusChange: (status: string) => void;
}) {
  const candidate = application.candidate;
  const contact = getCandidateContact(application);
  const skills = parseSkills(candidate?.skills).slice(0, 6);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                statusStyles[application.status] ||
                "border-slate-200 bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabels[application.status] || application.status}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {experienceLabels[candidate?.experienceLevel || ""] ||
                candidate?.experienceLevel ||
                "Опыт не указан"}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {getPreferredType(candidate)}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {getCandidateName(application)}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BriefcaseBusiness className="h-4 w-4" />
              {getJobTitle(application)}
            </span>

            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {candidate?.city || "Актау"},{" "}
              {candidate?.district || "район не указан"}
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getDate(application.createdAt)}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <Phone className="h-4 w-4 text-slate-400" />
              {contact.phone}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <Mail className="h-4 w-4 text-slate-400" />
              {contact.email}
            </div>
          </div>

          {application.coverLetter && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Сообщение кандидата
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {application.coverLetter}
              </p>
            </div>
          )}

          {skills.length > 0 && (
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
          )}
        </div>

        <div className="shrink-0 lg:w-60">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Статус отклика
            </span>

            <select
              value={application.status}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={updating}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300 disabled:opacity-60"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 grid gap-2">
            <Link
              href={`/ai-match?candidateId=${application.candidateId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              Анализ кандидата
            </Link>

            <Link
              href={`/ai-match?jobId=${application.jobId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Подбор для вакансии
            </Link>
          </div>

          {updating && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Обновляем...
            </div>
          )}
        </div>
      </div>
    </article>
  );
}