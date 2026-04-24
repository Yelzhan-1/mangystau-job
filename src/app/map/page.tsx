"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

type Employer = {
  id: string;
  companyName: string;
  businessType?: string | null;
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

const JobMap = dynamic<any>(
  () =>
    import("@/components/map/JobMap").then((mod: any) => {
      return mod.JobMap || mod.default;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[560px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаем карту...
        </div>
      </div>
    ),
  }
);

const fallbackJobs: Job[] = [
  {
    id: "map-job-1",
    title: "Официант / Официантка",
    description: "Работа в кафе рядом с домом.",
    sector: "Общественное питание",
    employmentType: "PART_TIME",
    experienceLevel: "NO_EXPERIENCE",
    city: "Актау",
    district: "Микрорайон 7",
    salaryMin: 90000,
    salaryMax: 130000,
    skills: "Коммуникабельность, Пунктуальность",
    employer: {
      id: "employer-1",
      companyName: "Кафе «Каспий»",
    },
  },
  {
    id: "map-job-2",
    title: "Курьер-доставщик",
    description: "Доставка заказов по району.",
    sector: "Доставка",
    employmentType: "PART_TIME",
    experienceLevel: "NO_EXPERIENCE",
    city: "Актау",
    district: "Микрорайон 12",
    salaryMin: 80000,
    salaryMax: 150000,
    skills: "Знание города, Ответственность",
    employer: {
      id: "employer-2",
      companyName: "Caspian Logistics",
    },
  },
  {
    id: "map-job-3",
    title: "Оператор склада",
    description: "Складская работа в промзоне.",
    sector: "Логистика",
    employmentType: "FULL_TIME",
    experienceLevel: "JUNIOR",
    city: "Актау",
    district: "Промзона",
    salaryMin: 120000,
    salaryMax: 180000,
    skills: "Физическая выносливость, Ответственность",
    employer: {
      id: "employer-3",
      companyName: "Aktau Supply",
    },
  },
];

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["data", "jobs", ...keys]) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Зарплата не указана";

  if (min && max) {
    return `${min.toLocaleString("ru-RU")}–${max.toLocaleString("ru-RU")} ₸`;
  }

  if (min) return `от ${min.toLocaleString("ru-RU")} ₸`;

  return `до ${max?.toLocaleString("ru-RU")} ₸`;
}

export default function MapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);

    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      const list = extractArray<Job>(data, ["jobs"]);

      setJobs(list.length > 0 ? list : fallbackJobs);
    } catch {
      setJobs(fallbackJobs);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return jobs;

    return jobs.filter((job) => {
      return (
        job.title?.toLowerCase().includes(value) ||
        job.sector?.toLowerCase().includes(value) ||
        job.district?.toLowerCase().includes(value) ||
        job.employer?.companyName?.toLowerCase().includes(value)
      );
    });
  }, [jobs, query]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <MapPin className="h-4 w-4" />
            Карта вакансий Актау
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Найдите работу рядом с домом
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Вакансии показаны по районам, чтобы соискатель видел не просто
                список, а реальные возможности поблизости.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Список вакансий
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4" />
                Умный подбор
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Фильтр карты</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Найдите вакансии по названию, сфере, району или компании.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Курьер, кафе, район..."
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-3xl font-bold text-slate-950">
              {filteredJobs.length}
            </div>
            <div className="mt-1 text-sm text-slate-500">вакансий на карте</div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="font-semibold text-slate-950">{job.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {job.employer?.companyName || "Компания"} ·{" "}
                  {job.district || "Актау"}
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="flex h-[560px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем карту...
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
              <JobMap jobs={filteredJobs} height="560px" />
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard label="Районы" value="Актау" />
            <InfoCard label="Вакансий" value={String(filteredJobs.length)} />
            <InfoCard label="Формат" value="Карта + список" />
          </div>

          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Почему карта важна
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Для локального рынка труда расстояние имеет значение. Если работа
              находится рядом с домом или учебой, кандидату проще добираться, а
              работодатель быстрее находит стабильного сотрудника.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}