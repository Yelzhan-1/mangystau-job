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
  Sparkles,
  Target,
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

type User = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Employer = {
  id: string;
  companyName: string;
  userId?: string;
  city?: string | null;
  district?: string | null;
  isVerified?: boolean;
};

type Candidate = {
  id: string;
  userId?: string;
  user?: User;
  bio?: string | null;
  city?: string | null;
  district?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  preferredType?: string | null;
  preferredJobType?: string | null;
  sector?: string | null;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  isAvailable?: boolean;
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

type Breakdown = {
  skills: number;
  location: number;
  employmentType: number;
  experience: number;
  sector: number;
  salary: number;
};

type JobMatch = {
  job: Job;
  score: number;
  breakdown: Breakdown;
  reasons: string[];
};

type CandidateMatch = {
  candidate: Candidate;
  score: number;
  breakdown: Breakdown;
  reasons: string[];
};

const SESSION_KEY = "mj_session";
const JOBS_KEY = "mj_jobs";
const PUBLIC_CANDIDATES_KEY = "mj_public_candidates";

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

const fallbackCandidates: Candidate[] = [
  {
    id: "fallback-candidate-1",
    user: {
      id: "fallback-user-1",
      name: "Айбек Джаксыбеков",
      email: "candidate@mangystaujobs.kz",
      phone: "+7 705 111 2233",
    },
    city: "Актау",
    district: "Микрорайон 7",
    experienceLevel: "NO_EXPERIENCE",
    preferredJobType: "PART_TIME",
    preferredType: "PART_TIME",
    expectedSalaryMin: 70000,
    expectedSalaryMax: 150000,
    skills: "Ответственность, Коммуникабельность, Пунктуальность, Работа с клиентами",
    bio: "Ищу подработку рядом с домом после учебы.",
    isAvailable: true,
  },
  {
    id: "fallback-candidate-2",
    user: {
      id: "fallback-user-2",
      name: "Дамир Сатыбалдиев",
      email: "damir@mail.kz",
      phone: "+7 708 333 4455",
    },
    city: "Актау",
    district: "Микрорайон 12",
    experienceLevel: "JUNIOR",
    preferredJobType: "FULL_TIME",
    preferredType: "FULL_TIME",
    expectedSalaryMin: 100000,
    expectedSalaryMax: 200000,
    skills: "Знание города, Водительские права кат. B, Ответственность, Физическая выносливость",
    bio: "Готов работать курьером или помощником на складе.",
    isAvailable: true,
  },
];

const weights = [
  { label: "Навыки", value: "35%" },
  { label: "Локация", value: "20%" },
  { label: "Тип работы", value: "15%" },
  { label: "Опыт", value: "10%" },
  { label: "Сфера", value: "10%" },
  { label: "Зарплата", value: "10%" },
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

function readCandidateProfile(sessionId: string): Candidate | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(`mj_candidate_profile_${sessionId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // normal comma text
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

function getCandidateName(candidate?: Candidate) {
  return candidate?.user?.name || "Кандидат";
}

function getEmployerName(job?: Job) {
  return job?.employer?.companyName || "Компания";
}

function getPreferredType(candidate?: Candidate) {
  const value = candidate?.preferredJobType || candidate?.preferredType || "";
  return employmentLabels[value] || value || "Тип работы не указан";
}

function getCommonSkills(a?: string | null, b?: string | null) {
  const first = parseSkills(a).map((item) => item.toLowerCase());
  const second = parseSkills(b).map((item) => item.toLowerCase());

  return first.filter((skill) => second.includes(skill));
}

function createBreakdownForCandidate(job: Job, candidate: Candidate): Breakdown {
  const jobSkills = parseSkills(job.skills);
  const candidateSkills = parseSkills(candidate.skills);
  const common = getCommonSkills(candidate.skills, job.skills);

  const skills =
    jobSkills.length === 0
      ? 15
      : Math.round((common.length / Math.max(jobSkills.length, 1)) * 35);

  const location =
    candidate.district && job.district && candidate.district === job.district
      ? 20
      : candidate.city && job.city && candidate.city === job.city
        ? 10
        : 0;

  const candidateType = candidate.preferredJobType || candidate.preferredType;
  const employmentType =
    candidateType && job.employmentType && candidateType === job.employmentType
      ? 15
      : 5;

  const experience =
    !job.experienceLevel ||
    job.experienceLevel === "NO_EXPERIENCE" ||
    job.experienceLevel === candidate.experienceLevel
      ? 10
      : 4;

  const sector = !candidate.sector || !job.sector || candidate.sector === job.sector ? 8 : 3;

  const expectedMin = candidate.expectedSalaryMin || 0;
  const expectedMax = candidate.expectedSalaryMax || 999999999;
  const salaryMin = job.salaryMin || 0;
  const salaryMax = job.salaryMax || 999999999;

  const salary = salaryMax >= expectedMin && salaryMin <= expectedMax ? 10 : 3;

  return {
    skills: Math.min(skills, 35),
    location,
    employmentType,
    experience,
    sector,
    salary,
  };
}

function createBreakdownForEmployer(job: Job, candidate: Candidate): Breakdown {
  return createBreakdownForCandidate(job, candidate);
}

function sumBreakdown(breakdown: Breakdown) {
  return Math.min(
    100,
    breakdown.skills +
      breakdown.location +
      breakdown.employmentType +
      breakdown.experience +
      breakdown.sector +
      breakdown.salary
  );
}

function createJobMatch(job: Job, candidate: Candidate): JobMatch {
  const breakdown = createBreakdownForCandidate(job, candidate);
  const common = getCommonSkills(candidate.skills, job.skills);
  const score = sumBreakdown(breakdown);

  const reasons = [
    common.length > 0
      ? `Совпадающие навыки: ${common.slice(0, 3).join(", ")}`
      : "Навыки частично подходят, но может потребоваться обучение.",
    candidate.district === job.district
      ? "Работа находится в том же районе."
      : "Локация отличается, но вакансия может быть подходящей.",
    (candidate.preferredJobType || candidate.preferredType) === job.employmentType
      ? "Тип занятости совпадает с предпочтением."
      : "Тип занятости отличается от предпочтения.",
  ];

  return {
    job,
    score,
    breakdown,
    reasons,
  };
}

function createCandidateMatch(job: Job, candidate: Candidate): CandidateMatch {
  const breakdown = createBreakdownForEmployer(job, candidate);
  const common = getCommonSkills(candidate.skills, job.skills);
  const score = sumBreakdown(breakdown);

  const reasons = [
    common.length > 0
      ? `Совпадающие навыки: ${common.slice(0, 3).join(", ")}`
      : "Навыки частично подходят, но кандидату может понадобиться адаптация.",
    candidate.district === job.district
      ? "Кандидат находится в том же районе."
      : "Район отличается, но кандидат может подойти.",
    (candidate.preferredJobType || candidate.preferredType) === job.employmentType
      ? "Предпочтительный формат работы совпадает."
      : "Формат работы отличается от предпочтения кандидата.",
  ];

  return {
    candidate,
    score,
    breakdown,
    reasons,
  };
}

export default function AiMatchPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [publicCandidates, setPublicCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  useEffect(() => {
    const current = readSession();

    if (!current) {
      setChecking(false);
      return;
    }

    setSession(current);

    const localJobs = readArray<Job>(JOBS_KEY);
    setJobs(localJobs.length > 0 ? localJobs : fallbackJobs);

    const candidates = readArray<Candidate>(PUBLIC_CANDIDATES_KEY);
    setPublicCandidates(candidates.length > 0 ? candidates : fallbackCandidates);

    if (current.role === "candidate") {
      const profile = readCandidateProfile(current.id);
      setCandidateProfile(profile);
    }

    if (current.role === "employer") {
      const companyJobs = localJobs.filter(
        (job) => job.employer?.userId === current.id
      );

      setJobs(companyJobs);

      if (companyJobs[0]?.id) {
        setSelectedJobId(companyJobs[0].id);
      }
    }

    setChecking(false);
  }, []);

  const candidateMatches = useMemo(() => {
    if (!candidateProfile) return [];

    const allJobs = jobs.length > 0 ? jobs : fallbackJobs;

    return allJobs
      .filter((job) => job.isActive !== false)
      .map((job) => createJobMatch(job, candidateProfile))
      .sort((a, b) => b.score - a.score);
  }, [candidateProfile, jobs]);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  const employerMatches = useMemo(() => {
    if (!selectedJob) return [];

    const candidates =
      publicCandidates.length > 0 ? publicCandidates : fallbackCandidates;

    return candidates
      .filter((candidate) => candidate.isAvailable !== false)
      .map((candidate) => createCandidateMatch(selectedJob, candidate))
      .sort((a, b) => b.score - a.score);
  }, [selectedJob, publicCandidates]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем подбор...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              Умный подбор
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-950">
              Войдите, чтобы использовать подбор
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Подбор работает по вашему профилю. Соискатель получает подходящие
              вакансии, а работодатель — подходящих кандидатов.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/login?mode=login"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Войти
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const isCandidate = session.role === "candidate";
  const isEmployer = session.role === "employer";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Sparkles className="h-4 w-4" />
            Подбор по текущему аккаунту
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {isCandidate
                  ? "Вакансии, которые подходят именно вам"
                  : isEmployer
                    ? "Кандидаты для ваших вакансий"
                    : "Панель подбора"}
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                {isCandidate
                  ? "Система сравнивает ваш профиль с вакансиями по навыкам, району, опыту, типу работы и зарплате."
                  : isEmployer
                    ? "Система сравнивает кандидатов с вашими вакансиями и объясняет, почему они подходят."
                    : "Администратор может просматривать работу подбора со стороны продукта."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:w-[420px]">
              <Stat label="Навыки" value="35%" />
              <Stat label="Локация" value="20%" />
              <Stat label="Остальное" value="45%" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 md:grid-cols-6">
          {weights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-950">
                {item.label}
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isCandidate && (
        <CandidateSection
          session={session}
          candidateProfile={candidateProfile}
          matches={candidateMatches}
        />
      )}

      {isEmployer && (
        <EmployerSection
          jobs={jobs}
          selectedJob={selectedJob}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          matches={employerMatches}
        />
      )}

      {session.role === "admin" && (
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Администраторский доступ
            </h2>
            <p className="mt-3 text-slate-600">
              Для проверки подбора войдите как соискатель или работодатель.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Открыть админку
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function CandidateSection({
  session,
  candidateProfile,
  matches,
}: {
  session: Session;
  candidateProfile: Candidate | null;
  matches: JobMatch[];
}) {
  if (!candidateProfile) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound className="h-6 w-6" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-950">
            Сначала создайте профиль
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
            {session.name}, чтобы подобрать вакансии, системе нужны ваш район,
            навыки, опыт и желаемый формат работы.
          </p>

          <Link
            href="/candidate"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Заполнить профиль
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr] lg:px-8">
      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <UserRound className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-950">
          Ваш профиль
        </h2>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div>{getCandidateName(candidateProfile)}</div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {candidateProfile.city || "Актау"},{" "}
            {candidateProfile.district || "район не указан"}
          </div>
          <div>{getPreferredType(candidateProfile)}</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {parseSkills(candidateProfile.skills)
            .slice(0, 6)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {skill}
              </span>
            ))}
        </div>

        <Link
          href="/candidate"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Изменить профиль
        </Link>
      </aside>

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Подходящие вакансии
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Найдено вариантов: {matches.length}
          </p>
        </div>

        <div className="grid gap-5">
          {matches.map((match) => (
            <JobMatchCard key={match.job.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmployerSection({
  jobs,
  selectedJob,
  selectedJobId,
  setSelectedJobId,
  matches,
}: {
  jobs: Job[];
  selectedJob?: Job;
  selectedJobId: string;
  setSelectedJobId: (value: string) => void;
  matches: CandidateMatch[];
}) {
  if (!jobs.length) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-950">
            Сначала создайте вакансию
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
            После публикации вакансии система сможет подобрать подходящих
            кандидатов по навыкам, району, опыту и типу работы.
          </p>

          <Link
            href="/employer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Создать вакансию
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr] lg:px-8">
      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Building2 className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-950">
          Ваша вакансия
        </h2>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">
            Выберите вакансию
          </span>
          <select
            value={selectedJobId || selectedJob?.id || ""}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>

        {selectedJob && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="font-semibold text-slate-950">
              {selectedJob.title}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {selectedJob.city || "Актау"}, {selectedJob.district}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">
              {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
            </div>
          </div>
        )}

        <Link
          href="/employer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Управлять вакансиями
        </Link>
      </aside>

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Подходящие кандидаты
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Найдено кандидатов: {matches.length}
          </p>
        </div>

        <div className="grid gap-5">
          {matches.map((match) => (
            <CandidateMatchCard key={match.candidate.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JobMatchCard({ match }: { match: JobMatch }) {
  const job = match.job;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <ScoreBadge score={match.score} />

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{getEmployerName(job)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city || "Актау"}, {job.district || "район не указан"}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {job.description}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {match.reasons.map((reason) => (
              <div
                key={reason}
                className="flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 lg:w-56">
          <div className="rounded-2xl bg-slate-50 p-4 text-right">
            <div className="text-lg font-bold text-slate-950">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {employmentLabels[job.employmentType || ""] || job.employmentType}
            </div>
          </div>

          <Link
            href="/jobs"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Открыть вакансии
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CandidateMatchCard({ match }: { match: CandidateMatch }) {
  const candidate = match.candidate;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <ScoreBadge score={match.score} />

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {getCandidateName(candidate)}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {candidate.city || "Актау"},{" "}
              {candidate.district || "район не указан"}
            </span>
            <span>{getPreferredType(candidate)}</span>
          </div>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {candidate.bio ||
              "Кандидат открыт к предложениям и готов обсудить условия работы."}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {match.reasons.map((reason) => (
              <div
                key={reason}
                className="flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 lg:w-56">
          <div className="rounded-2xl bg-slate-50 p-4 text-right">
            <div className="text-sm text-slate-500">Контакты</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {candidate.user?.phone || candidate.user?.email || "Не указано"}
            </div>
          </div>

          <Link
            href="/workers"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Открыть работников
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 75 ? "Высокое совпадение" : score >= 50 ? "Среднее совпадение" : "Частичное совпадение";

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
      <Target className="h-4 w-4" />
      {score}% · {label}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
