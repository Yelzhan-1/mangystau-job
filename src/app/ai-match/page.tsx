"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
  UserRound,
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
  preferredType?: string | null;
  preferredJobType?: string | null;
  sector?: string | null;
  user?: User;
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
  employer?: Employer;
};

type Breakdown = {
  skills?: number;
  location?: number;
  employmentType?: number;
  experience?: number;
  sector?: number;
  salary?: number;
};

type JobMatch = {
  job: Job;
  score: number;
  reasons?: string[];
  weakPoints?: string[];
  breakdown?: Breakdown;
  explanation?: string;
};

type CandidateMatch = {
  candidate: Candidate;
  score: number;
  reasons?: string[];
  weakPoints?: string[];
  breakdown?: Breakdown;
  explanation?: string;
};

type Summary = {
  totalJobs?: number;
  totalCandidates?: number;
  totalEmployers?: number;
  strongestSectors?: unknown;
  districtsWithMostJobs?: unknown;
  mostCommonSkills?: unknown;
  insight?: string;
  insightText?: string;
};

const JobMap = dynamic(
  () =>
    import("@/components/map/JobMap").then(
      (mod: any) => mod.JobMap || mod.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[340px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаем карту...
        </div>
      </div>
    ),
  }
) as ComponentType<{ jobs: Job[]; height?: string; className?: string }>;

const breakdownLabels: Record<keyof Breakdown, string> = {
  skills: "Навыки",
  location: "Локация",
  employmentType: "Тип работы",
  experience: "Опыт",
  sector: "Сфера",
  salary: "Зарплата",
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

const weights = [
  { label: "Навыки", value: "35%" },
  { label: "Локация", value: "20%" },
  { label: "Тип работы", value: "15%" },
  { label: "Опыт", value: "10%" },
  { label: "Сфера", value: "10%" },
  { label: "Зарплата", value: "10%" },
];

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["matches", "results", "data", ...keys]) {
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

function getTopValue(value: unknown, fallback: string) {
  if (!value) return fallback;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const first = value[0];

    if (!first) return fallback;

    if (typeof first === "string") return first;

    if (typeof first === "object") {
      const item = first as Record<string, any>;

      return (
        item.name ||
        item.sector ||
        item.district ||
        item.skill ||
        item.label ||
        item.title ||
        fallback
      );
    }
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length > 0) {
      const sorted = entries.sort(
        (a, b) => Number(b[1] || 0) - Number(a[1] || 0)
      );

      return sorted[0]?.[0] || fallback;
    }
  }

  return fallback;
}

function getCandidateName(candidate?: Candidate) {
  return candidate?.user?.name || "Кандидат";
}

function getCompanyName(job?: Job) {
  return job?.employer?.companyName || "Компания";
}

function getPreferredType(candidate?: Candidate) {
  const value = candidate?.preferredJobType || candidate?.preferredType || "";
  return employmentLabels[value] || value || "Тип работы не указан";
}

function getScoreStyle(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 55) return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-xl font-bold ${getScoreStyle(
        score
      )}`}
    >
      {score}%
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-2xl font-bold text-slate-950">
        {loading ? "—" : value}
      </div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-blue-600" />
      <div className="mt-4 text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function BreakdownBars({ breakdown }: { breakdown?: Breakdown }) {
  if (!breakdown) return null;

  const entries = Object.entries(breakdown).filter(
    ([, value]) => typeof value === "number"
  ) as [keyof Breakdown, number][];

  if (entries.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {breakdownLabels[key]}
            </span>
            <span className="font-semibold text-slate-900">
              {Math.round(value)}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReasonsList({
  title,
  items,
  type,
}: {
  title: string;
  items?: string[];
  type: "good" | "weak";
}) {
  if (!items || items.length === 0) return null;

  const Icon = type === "good" ? CheckCircle2 : XCircle;

  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-slate-950">{title}</div>

      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div
            key={item}
            className="flex gap-2 text-sm leading-6 text-slate-600"
          >
            <Icon
              className={`mt-1 h-4 w-4 shrink-0 ${
                type === "good" ? "text-emerald-600" : "text-amber-600"
              }`}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Sparkles className="h-6 w-6" />
      </div>

      <h3 className="mt-6 text-xl font-semibold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default function AiMatchPage() {
  const [activeTab, setActiveTab] = useState<"candidate" | "employer">(
    "candidate"
  );

  const [summary, setSummary] = useState<Summary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);

  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedEmployerId, setSelectedEmployerId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const [candidateMatches, setCandidateMatches] = useState<JobMatch[]>([]);
  const [employerMatches, setEmployerMatches] = useState<CandidateMatch[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();

    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    const candidateId = params.get("candidateId");

    if (jobId) {
      setActiveTab("employer");
      setSelectedJobId(jobId);
      generateCandidateMatches(jobId);
    }

    if (candidateId) {
      setActiveTab("candidate");
      setSelectedCandidateId(candidateId);
      generateJobMatches(candidateId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEmployerId) {
      loadEmployerJobs(selectedEmployerId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployerId]);

  async function loadInitialData() {
    setLoadingInitial(true);

    try {
      const [summaryRes, candidatesRes, employersRes] = await Promise.all([
        fetch("/api/ai/summary"),
        fetch("/api/candidates"),
        fetch("/api/employers"),
      ]);

      const [summaryData, candidatesData, employersData] = await Promise.all([
        summaryRes.json(),
        candidatesRes.json(),
        employersRes.json(),
      ]);

      const candidateList = extractArray<Candidate>(candidatesData, [
        "candidates",
      ]);

      const employerList = extractArray<Employer>(employersData, ["employers"]);

      setSummary(summaryData);
      setCandidates(candidateList);
      setEmployers(employerList);

      if (!selectedCandidateId && candidateList[0]?.id) {
        setSelectedCandidateId(candidateList[0].id);
      }

      if (!selectedEmployerId && employerList[0]?.id) {
        setSelectedEmployerId(employerList[0].id);
      }
    } catch {
      setError("Не удалось загрузить данные для подбора.");
    } finally {
      setLoadingInitial(false);
    }
  }

  async function loadEmployerJobs(employerId: string) {
    try {
      const res = await fetch(`/api/jobs?employerId=${employerId}`);
      const data = await res.json();
      const list = extractArray<Job>(data, ["jobs"]);

      setEmployerJobs(list);

      if (!selectedJobId && list[0]?.id) {
        setSelectedJobId(list[0].id);
      }
    } catch {
      setEmployerJobs([]);
    }
  }

  async function generateJobMatches(candidateId = selectedCandidateId) {
    if (!candidateId) {
      setError("Выберите профиль соискателя.");
      return;
    }

    setError("");
    setMatchingLoading(true);

    try {
      const res = await fetch(
        `/api/ai/jobs-for-candidate?candidateId=${candidateId}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Не удалось выполнить подбор.");
        return;
      }

      setCandidateMatches(extractArray<JobMatch>(data, ["jobMatches"]));
    } catch {
      setError("Ошибка соединения при подборе вакансий.");
    } finally {
      setMatchingLoading(false);
    }
  }

  async function generateCandidateMatches(jobId = selectedJobId) {
    if (!jobId) {
      setError("Выберите вакансию.");
      return;
    }

    setError("");
    setMatchingLoading(true);

    try {
      const res = await fetch(`/api/ai/candidates-for-job?jobId=${jobId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Не удалось выполнить подбор.");
        return;
      }

      setEmployerMatches(
        extractArray<CandidateMatch>(data, ["candidateMatches"])
      );
    } catch {
      setError("Ошибка соединения при подборе кандидатов.");
    } finally {
      setMatchingLoading(false);
    }
  }

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId),
    [candidates, selectedCandidateId]
  );

  const selectedJob = useMemo(
    () => employerJobs.find((job) => job.id === selectedJobId),
    [employerJobs, selectedJobId]
  );

  const topJobsForMap = useMemo(
    () =>
      candidateMatches
        .map((match) => match.job)
        .filter(Boolean)
        .slice(0, 5),
    [candidateMatches]
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                Умный подбор вакансий и кандидатов
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Подбор, который можно объяснить
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Платформа сравнивает вакансии и кандидатов по навыкам, району,
                типу работы, опыту, сфере и зарплате — и показывает понятный
                match score.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
              <SummaryCard
                label="Вакансии"
                value={summary?.totalJobs ?? 0}
                loading={loadingInitial}
              />
              <SummaryCard
                label="Кандидаты"
                value={summary?.totalCandidates ?? 0}
                loading={loadingInitial}
              />
              <SummaryCard
                label="Компании"
                value={summary?.totalEmployers ?? 0}
                loading={loadingInitial}
              />
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <InsightCard
              icon={BarChart3}
              title="Активная сфера"
              value={getTopValue(
                summary?.strongestSectors,
                "Общественное питание"
              )}
            />

            <InsightCard
              icon={MapPin}
              title="Активный район"
              value={getTopValue(
                summary?.districtsWithMostJobs,
                "Микрорайон 7"
              )}
            />

            <InsightCard
              icon={Target}
              title="Популярный навык"
              value={getTopValue(
                summary?.mostCommonSkills,
                "Ответственность"
              )}
            />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">
              {summary?.insight ||
                summary?.insightText ||
                "Платформа анализирует локальный рынок труда и помогает быстрее соединять подходящих кандидатов с актуальными вакансиями."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-6">
          {weights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-950">
                {item.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-600">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid rounded-[1.5rem] bg-slate-100 p-1 sm:grid-cols-2">
            <button
              onClick={() => setActiveTab("candidate")}
              className={`rounded-[1.25rem] px-5 py-3 text-sm font-semibold transition ${
                activeTab === "candidate"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Для соискателя
            </button>

            <button
              onClick={() => setActiveTab("employer")}
              className={`rounded-[1.25rem] px-5 py-3 text-sm font-semibold transition ${
                activeTab === "employer"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Для работодателя
            </button>
          </div>

          <div className="p-6 lg:p-8">
            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {activeTab === "candidate" ? (
              <CandidateMatchSection
                candidates={candidates}
                selectedCandidateId={selectedCandidateId}
                setSelectedCandidateId={setSelectedCandidateId}
                selectedCandidate={selectedCandidate}
                matches={candidateMatches}
                loading={matchingLoading}
                onGenerate={() => generateJobMatches()}
                topJobsForMap={topJobsForMap}
              />
            ) : (
              <EmployerMatchSection
                employers={employers}
                employerJobs={employerJobs}
                selectedEmployerId={selectedEmployerId}
                selectedJobId={selectedJobId}
                setSelectedEmployerId={(id) => {
                  setSelectedEmployerId(id);
                  setSelectedJobId("");
                  setEmployerMatches([]);
                }}
                setSelectedJobId={setSelectedJobId}
                selectedJob={selectedJob}
                matches={employerMatches}
                loading={matchingLoading}
                onGenerate={() => generateCandidateMatches()}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function CandidateMatchSection({
  candidates,
  selectedCandidateId,
  setSelectedCandidateId,
  selectedCandidate,
  matches,
  loading,
  onGenerate,
  topJobsForMap,
}: {
  candidates: Candidate[];
  selectedCandidateId: string;
  setSelectedCandidateId: (value: string) => void;
  selectedCandidate?: Candidate;
  matches: JobMatch[];
  loading: boolean;
  onGenerate: () => void;
  topJobsForMap: Job[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <UserRound className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Подбор вакансий
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Выберите профиль соискателя, чтобы увидеть лучшие предложения рядом.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-700">Профиль</span>

          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300"
          >
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {getCandidateName(candidate)} ·{" "}
                {candidate.district || "район не указан"}
              </option>
            ))}
          </select>
        </label>

        {selectedCandidate && (
          <div className="mt-5 rounded-2xl bg-white p-4">
            <div className="font-semibold text-slate-950">
              {getCandidateName(selectedCandidate)}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {selectedCandidate.city || "Актау"},{" "}
              {selectedCandidate.district || "район не указан"}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {parseSkills(selectedCandidate.skills)
                .slice(0, 4)
                .map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Подбираем...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Подобрать вакансии
            </>
          )}
        </button>
      </aside>

      <div className="space-y-6">
        {matches.length > 0 && topJobsForMap.length > 0 && (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">
                  Лучшие вакансии на карте
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Локация — один из факторов подбора.
                </p>
              </div>

              <MapPin className="h-5 w-5 text-blue-600" />
            </div>

            <JobMap jobs={topJobsForMap} height="340px" />
          </div>
        )}

        {matches.length === 0 ? (
          <EmptyState
            title="Пока нет результатов"
            text="Выберите профиль и нажмите кнопку подбора, чтобы увидеть лучшие вакансии."
          />
        ) : (
          matches.map((match, index) => (
            <JobMatchCard
              key={match.job.id || index}
              match={match}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmployerMatchSection({
  employers,
  employerJobs,
  selectedEmployerId,
  selectedJobId,
  setSelectedEmployerId,
  setSelectedJobId,
  selectedJob,
  matches,
  loading,
  onGenerate,
}: {
  employers: Employer[];
  employerJobs: Job[];
  selectedEmployerId: string;
  selectedJobId: string;
  setSelectedEmployerId: (value: string) => void;
  setSelectedJobId: (value: string) => void;
  selectedJob?: Job;
  matches: CandidateMatch[];
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Building2 className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Подбор кандидатов
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Выберите компанию и вакансию, чтобы найти подходящих кандидатов.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-700">Компания</span>

          <select
            value={selectedEmployerId}
            onChange={(e) => setSelectedEmployerId(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300"
          >
            {employers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                {employer.companyName}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">Вакансия</span>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300"
          >
            {employerJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>

        {selectedJob && (
          <div className="mt-5 rounded-2xl bg-white p-4">
            <div className="font-semibold text-slate-950">
              {selectedJob.title}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {selectedJob.city}, {selectedJob.district}
            </div>

            <div className="mt-3 text-sm font-semibold text-slate-900">
              {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
            </div>
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ищем...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Найти кандидатов
            </>
          )}
        </button>
      </aside>

      <div className="space-y-6">
        {matches.length === 0 ? (
          <EmptyState
            title="Кандидаты ещё не выбраны"
            text="Выберите вакансию и запустите подбор, чтобы увидеть рейтинг кандидатов."
          />
        ) : (
          matches.map((match, index) => (
            <CandidateMatchCard
              key={match.candidate.id || index}
              match={match}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

function JobMatchCard({ match, index }: { match: JobMatch; index: number }) {
  const job = match.job;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-blue-600">
            #{index + 1} подходящая вакансия
          </div>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">
              {getCompanyName(job)}
            </span>

            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city}, {job.district}
            </span>

            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {match.explanation ||
              "Вакансия подходит по нескольким критериям: навыки, район, формат работы и ожидания по зарплате."}
          </p>
        </div>

        <ScoreBadge score={Math.round(match.score)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ReasonsList
          title="Почему подходит"
          items={match.reasons}
          type="good"
        />

        <ReasonsList
          title="Что стоит проверить"
          items={match.weakPoints}
          type="weak"
        />
      </div>

      <div className="mt-6">
        <BreakdownBars breakdown={match.breakdown} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Перейти к вакансиям
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function CandidateMatchCard({
  match,
  index,
}: {
  match: CandidateMatch;
  index: number;
}) {
  const candidate = match.candidate;
  const skills = parseSkills(candidate.skills).slice(0, 5);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="text-sm font-semibold text-blue-600">
            #{index + 1} подходящий кандидат
          </div>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {getCandidateName(candidate)}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>
              {candidate.user?.phone ||
                candidate.user?.email ||
                "Контакт не указан"}
            </span>

            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {candidate.city || "Актау"},{" "}
              {candidate.district || "район не указан"}
            </span>

            <span>{getPreferredType(candidate)}</span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {match.explanation ||
              "Кандидат подходит по нескольким критериям: навыки, район, опыт и формат работы."}
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

        <ScoreBadge score={Math.round(match.score)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ReasonsList
          title="Почему подходит"
          items={match.reasons}
          type="good"
        />

        <ReasonsList
          title="Что стоит проверить"
          items={match.weakPoints}
          type="weak"
        />
      </div>

      <div className="mt-6">
        <BreakdownBars breakdown={match.breakdown} />
      </div>
    </article>
  );
}