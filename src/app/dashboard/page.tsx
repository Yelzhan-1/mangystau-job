"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

type Role = "candidate" | "employer" | "admin";

type Session = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type Job = {
  id: string;
  title: string;
  description?: string;
  sector?: string;
  district?: string;
  city?: string;
  employer?: {
    id?: string;
    companyName?: string;
    userId?: string;
  };
};

type CandidateProfile = {
  id: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  city?: string;
  district?: string;
  bio?: string;
  skills?: string;
  experienceLevel?: string;
  preferredJobType?: string;
  preferredType?: string;
};

type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  employerId?: string | null;
  message?: string;
  status: "NEW" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";
  createdAt: string;
  job?: Job;
  candidate?: CandidateProfile;
};

const SESSION_KEY = "mj_session";
const APPLICATION_KEYS = ["mj_applications", "mangystau_applications"];
const JOBS_KEY = "mj_jobs";

const statusLabels: Record<Application["status"], string> = {
  NEW: "Новый",
  REVIEWED: "Просмотрен",
  SHORTLISTED: "Шорт-лист",
  REJECTED: "Отклонён",
  HIRED: "Нанят",
};

const statusStyles: Record<Application["status"], string> = {
  NEW: "bg-blue-50 text-blue-700",
  REVIEWED: "bg-slate-100 text-slate-700",
  SHORTLISTED: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700",
  HIRED: "bg-emerald-50 text-emerald-700",
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

function readApplications(): Application[] {
  const all: Application[] = [];

  for (const key of APPLICATION_KEYS) {
    const list = readArray<Application>(key);

    for (const item of list) {
      if (!all.some((existing) => existing.id === item.id)) {
        all.push(item);
      }
    }
  }

  return all.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function saveApplications(applications: Application[]) {
  localStorage.setItem("mj_applications", JSON.stringify(applications));
  localStorage.setItem("mangystau_applications", JSON.stringify(applications));
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return "Дата не указана";

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function candidateName(candidate?: CandidateProfile) {
  return candidate?.user?.name || "Кандидат";
}

function candidateContact(candidate?: CandidateProfile) {
  return candidate?.user?.phone || candidate?.user?.email || "Контакт не указан";
}

function normalizePhone(value?: string) {
  return (value || "").replace(/[^\d]/g, "");
}

function contactCandidate(candidate?: CandidateProfile) {
  if (!candidate) return;

  const phone = candidate.user?.phone || "";
  const email = candidate.user?.email || "";
  const name = candidate.user?.name || "кандидат";
  const digits = normalizePhone(phone);

  const text = encodeURIComponent(
    "Здравствуйте! Я увидел(а) ваш отклик на MangystauJobs и хотел(а) бы обсудить вакансию."
  );

  if (digits.length >= 10) {
    window.open(`https://wa.me/${digits}?text=${text}`, "_blank");
    return;
  }

  if (phone) {
    window.location.href = `tel:${phone}`;
    return;
  }

  if (email) {
    const subject = encodeURIComponent("Ответ на отклик");
    const body = encodeURIComponent(
      `Здравствуйте, ${name}! Спасибо за отклик на вакансию. Хотел(а) бы обсудить детали.`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    return;
  }

  alert("У кандидата пока нет телефона или email.");
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | Application["status"]>("ALL");

  useEffect(() => {
    const current = readSession();

    if (!current) {
      window.location.href = "/login?mode=login";
      return;
    }

    if (current.role !== "employer" && current.role !== "admin") {
      window.location.href = "/account";
      return;
    }

    setSession(current);
    loadApplications(current);
    setChecking(false);
  }, []);

  function loadApplications(current: Session) {
    const allApplications = readApplications();
    const employerJobs = readArray<Job>(JOBS_KEY).filter(
      (job) =>
        job.employer?.userId === current.id ||
        job.employer?.companyName === current.name
    );

    const employerJobIds = new Set(employerJobs.map((job) => job.id));
    const employerId = `employer-${current.id}`;

    const visible =
      current.role === "admin"
        ? allApplications
        : allApplications.filter((application) => {
            return (
              application.employerId === employerId ||
              employerJobIds.has(application.jobId) ||
              application.job?.employer?.userId === current.id ||
              application.job?.employer?.companyName === current.name
            );
          });

    setApplications(visible);
  }

  function updateStatus(id: string, nextStatus: Application["status"]) {
    const all = readApplications();

    const updatedAll = all.map((application) =>
      application.id === id
        ? {
            ...application,
            status: nextStatus,
          }
        : application
    );

    saveApplications(updatedAll);

    if (session) {
      loadApplications(session);
    }
  }

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus = status === "ALL" || application.status === status;

      const matchesSearch =
        !query ||
        application.job?.title?.toLowerCase().includes(query) ||
        application.candidate?.user?.name?.toLowerCase().includes(query) ||
        application.message?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [applications, search, status]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      new: applications.filter((item) => item.status === "NEW").length,
      shortlisted: applications.filter((item) => item.status === "SHORTLISTED")
        .length,
      hired: applications.filter((item) => item.status === "HIRED").length,
    };
  }, [applications]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем отклики...
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Building2 className="h-4 w-4" />
            Кабинет работодателя
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Отклики и кандидаты
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Здесь работодатель видит отклики на свои вакансии, сообщение
                кандидата, контакты и может менять статус заявки.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:w-[520px]">
              <Stat label="Всего" value={stats.total} />
              <Stat label="Новые" value={stats.new} />
              <Stat label="Шорт-лист" value={stats.shortlisted} />
              <Stat label="Наняты" value={stats.hired} />
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
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
                    После отклика кандидата работодатель может посмотреть
                    профиль, сообщение и обновить статус: новый, просмотрен,
                    шорт-лист, отклонён или нанят.
                  </p>
                </div>
              </div>

              <Link
                href="/ai-match"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
              >
                Открыть подбор
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Building2 className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            {session.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Отклики показываются только на вакансии этой компании.
          </p>

          <Link
            href="/employer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Разместить вакансию
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/jobs"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Смотреть вакансии
          </Link>
        </aside>

        <div>
          <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
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
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по кандидату..."
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-72"
                  />
                </div>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "ALL" | Application["status"])
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="NEW">Новые</option>
                  <option value="REVIEWED">Просмотренные</option>
                  <option value="SHORTLISTED">Шорт-лист</option>
                  <option value="REJECTED">Отклонённые</option>
                  <option value="HIRED">Нанятые</option>
                </select>
              </div>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Откликов пока нет
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Когда кандидаты откликнутся на вакансии выбранного
                работодателя, они появятся здесь.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onUpdateStatus={updateStatus}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ApplicationCard({
  application,
  onUpdateStatus,
}: {
  application: Application;
  onUpdateStatus: (id: string, status: Application["status"]) => void;
}) {
  const candidate = application.candidate;
  const job = application.job;
  const skills = parseSkills(candidate?.skills).slice(0, 6);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[application.status]
              }`}
            >
              {statusLabels[application.status]}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {formatDate(application.createdAt)}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {candidateName(candidate)}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Отклик на вакансию:{" "}
            <span className="font-semibold text-slate-800">
              {job?.title || "Вакансия"}
            </span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Контакт: {candidateContact(candidate)}
          </p>

          {candidate?.district && (
            <p className="mt-2 text-sm text-slate-500">
              Район: {candidate.city || "Актау"}, {candidate.district}
            </p>
          )}

          {application.message && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Сообщение кандидата
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {application.message}
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

        <div className="shrink-0 lg:w-64">
          <button
            onClick={() => contactCandidate(candidate)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Связаться
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-3 grid gap-2">
            <StatusButton
              active={application.status === "REVIEWED"}
              icon={<Clock className="h-4 w-4" />}
              label="Просмотрен"
              onClick={() => onUpdateStatus(application.id, "REVIEWED")}
            />

            <StatusButton
              active={application.status === "SHORTLISTED"}
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="В шорт-лист"
              onClick={() => onUpdateStatus(application.id, "SHORTLISTED")}
            />

            <StatusButton
              active={application.status === "HIRED"}
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Нанят"
              onClick={() => onUpdateStatus(application.id, "HIRED")}
            />

            <StatusButton
              active={application.status === "REJECTED"}
              icon={<XCircle className="h-4 w-4" />}
              label="Отклонить"
              onClick={() => onUpdateStatus(application.id, "REJECTED")}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
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