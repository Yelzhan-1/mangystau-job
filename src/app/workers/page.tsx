"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Candidate = {
  id: string;
  bio?: string | null;
  city?: string | null;
  district?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  preferredType?: string | null;
  preferredJobType?: string | null;
  isAvailable?: boolean;
  user?: User;
};

const PUBLIC_CANDIDATES_KEY = "mj_public_candidates";

const fallbackCandidates: Candidate[] = [
  {
    id: "candidate-1",
    city: "Актау",
    district: "Микрорайон 7",
    experienceLevel: "NO_EXPERIENCE",
    preferredJobType: "PART_TIME",
    skills:
      "Коммуникабельность, Ответственность, Пунктуальность, Работа с клиентами",
    bio: "Ищу подработку рядом с домом после учебы. Быстро обучаюсь и готов работать с людьми.",
    isAvailable: true,
    user: {
      id: "user-1",
      name: "Айбек Джаксыбеков",
      email: "candidate@mangystaujobs.kz",
      phone: "+7 705 111 2233",
    },
  },
  {
    id: "candidate-2",
    city: "Актау",
    district: "Микрорайон 12",
    experienceLevel: "JUNIOR",
    preferredJobType: "FULL_TIME",
    skills:
      "Знание города, Водительские права кат. B, Ответственность, Русский язык",
    bio: "Готов работать курьером или помощником на складе. Хорошо знаю районы города.",
    isAvailable: true,
    user: {
      id: "user-2",
      name: "Дамир Сатыбалдиев",
      email: "damir@mail.kz",
      phone: "+7 708 333 4455",
    },
  },
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
  "Актау",
];

const experienceLevels = [
  { value: "ALL", label: "Любой опыт" },
  { value: "NO_EXPERIENCE", label: "Без опыта" },
  { value: "JUNIOR", label: "Начинающий" },
  { value: "MIDDLE", label: "Средний опыт" },
  { value: "SENIOR", label: "Опытный" },
];

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

function readPublicCandidates(): Candidate[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(PUBLIC_CANDIDATES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of ["data", "candidates", ...keys]) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function parseSkills(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPreferredType(candidate: Candidate) {
  const value = candidate.preferredJobType || candidate.preferredType || "";
  return employmentLabels[value] || value || "Тип работы не указан";
}

function normalizePhone(value?: string | null) {
  return (value || "").replace(/[^\d]/g, "");
}

function handleContactCandidate(candidate: Candidate) {
  const phone = candidate.user?.phone || "";
  const email = candidate.user?.email || "";
  const name = candidate.user?.name || "кандидат";
  const digits = normalizePhone(phone);

  const text = encodeURIComponent(
    "Здравствуйте! Меня заинтересовал ваш профиль на MangystauJobs. Хотел(а) бы связаться по поводу работы."
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
    const subject = encodeURIComponent("Предложение о работе");
    const body = encodeURIComponent(
      `Здравствуйте, ${name}! Меня заинтересовал ваш профиль на MangystauJobs. Хотел(а) бы обсудить работу.`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    return;
  }

  alert("У этого кандидата пока нет телефона или email для связи.");
}

export default function WorkersPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("Все районы");
  const [experience, setExperience] = useState("ALL");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoading(true);

    try {
      const localCandidates = readPublicCandidates();

      const res = await fetch("/api/candidates", { cache: "no-store" });
      const data = await res.json();
      const apiCandidates = extractArray<Candidate>(data, ["candidates"]);

      const merged = [
        ...localCandidates,
        ...apiCandidates.filter(
          (apiCandidate) =>
            !localCandidates.some((local) => local.id === apiCandidate.id)
        ),
      ];

      setCandidates(merged.length > 0 ? merged : fallbackCandidates);
    } catch {
      const localCandidates = readPublicCandidates();
      setCandidates(
        localCandidates.length > 0 ? localCandidates : fallbackCandidates
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    const value = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const skills = parseSkills(candidate.skills).join(" ").toLowerCase();

      const matchesSearch =
        !value ||
        candidate.user?.name?.toLowerCase().includes(value) ||
        candidate.district?.toLowerCase().includes(value) ||
        candidate.city?.toLowerCase().includes(value) ||
        skills.includes(value);

      const matchesDistrict =
        district === "Все районы" || candidate.district === district;

      const matchesExperience =
        experience === "ALL" || candidate.experienceLevel === experience;

      return matchesSearch && matchesDistrict && matchesExperience;
    });
  }, [candidates, query, district, experience]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Users className="h-4 w-4" />
            Открытые профили соискателей
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Работники Мангистау
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Профили соискателей, которые готовы к работе. Работодатель может
                быстро найти кандидата по району, навыкам и опыту.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/candidate"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <UserRound className="h-4 w-4" />
                Создать профиль
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4" />
                Подбор
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-slate-950">Фильтры</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Найдите кандидатов по имени, району, навыкам или опыту.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-slate-700">Поиск</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Айбек, курьер, MS Office..."
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Район</span>
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

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Опыт</span>
            <select
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
            >
              {experienceLevels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              setQuery("");
              setDistrict("Все районы");
              setExperience("ALL");
            }}
            className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Сбросить фильтры
          </button>
        </aside>

        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Доступные кандидаты
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Найдено профилей: {filteredCandidates.length}
              </p>
            </div>

            <Link
              href="/employer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Разместить вакансию
            </Link>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем профили...
              </div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                По этим фильтрам кандидатов нет
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Попробуйте изменить район, опыт или поисковый запрос.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const skills = parseSkills(candidate.skills).slice(0, 6);
  const phone = candidate.user?.phone || "";
  const email = candidate.user?.email || "";

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {experienceLabels[candidate.experienceLevel || ""] ||
                candidate.experienceLevel ||
                "Опыт не указан"}
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {getPreferredType(candidate)}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {candidate.user?.name || "Кандидат"}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {candidate.city || "Актау"},{" "}
              {candidate.district || "район не указан"}
            </span>

            {phone && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {phone}
              </span>
            )}

            {!phone && email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {email}
              </span>
            )}
          </div>

          {candidate.bio && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {candidate.bio}
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

        <div className="shrink-0 lg:w-56">
          <Link
            href={`/ai-match?candidateId=${candidate.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            Открыть подбор
          </Link>

          <button
            onClick={() => handleContactCandidate(candidate)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Связаться
          </button>
        </div>
      </div>
    </article>
  );
}
