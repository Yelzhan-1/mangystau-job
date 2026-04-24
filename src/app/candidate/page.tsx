"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
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
  sector?: string | null;
  isAvailable?: boolean;
  user?: User;
};

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
  "MS Office",
  "Кассовый аппарат",
  "Физическая выносливость",
  "Водительские права кат. B",
  "Санитарные нормы",
  "Работа с клиентами",
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

  for (const key of ["data", "candidates", ...keys]) {
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

function getPreferredType(candidate: Candidate) {
  const value = candidate.preferredJobType || candidate.preferredType || "";
  return employmentLabels[value] || value || "Тип работы не указан";
}

export default function CandidatePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Актау",
    district: "Микрорайон 7",
    experienceLevel: "NO_EXPERIENCE",
    preferredJobType: "PART_TIME",
    bio: "",
    expectedSalaryMin: "",
    expectedSalaryMax: "",
    customSkill: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Ответственность",
    "Пунктуальность",
  ]);

  const availableCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.isAvailable !== false),
    [candidates]
  );

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoading(true);

    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      const list = extractArray<Candidate>(data, ["candidates"]);

      setCandidates(list);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
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

  async function createCandidate() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setMessage({
        type: "error",
        text: "Заполните имя, email и телефон.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
        district: form.district,
        skills: selectedSkills.join(", "),
        experienceLevel: form.experienceLevel,
        preferredJobType: form.preferredJobType,
        preferredType: form.preferredJobType,
        bio: form.bio.trim(),
        expectedSalaryMin: form.expectedSalaryMin
          ? Number(form.expectedSalaryMin)
          : null,
        expectedSalaryMax: form.expectedSalaryMax
          ? Number(form.expectedSalaryMax)
          : null,
      };

      const res = await fetch("/api/candidates", {
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
          text: data.error || data.message || "Не удалось создать профиль.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Профиль создан. Теперь можно искать вакансии и запускать подбор.",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        city: "Актау",
        district: "Микрорайон 7",
        experienceLevel: "NO_EXPERIENCE",
        preferredJobType: "PART_TIME",
        bio: "",
        expectedSalaryMin: "",
        expectedSalaryMax: "",
        customSkill: "",
      });

      setSelectedSkills(["Ответственность", "Пунктуальность"]);
      await loadCandidates();
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
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <UserRound className="h-4 w-4" />
                Кабинет соискателя
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Создайте профиль и найдите работу рядом
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Укажите навыки, район и формат занятости. После этого можно
                откликаться на вакансии и получать умный подбор.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
              <MetricCard label="Профилей" value={candidates.length} />
              <MetricCard label="Активных" value={availableCandidates.length} />
              <MetricCard label="Навыков" value={skillOptions.length} />
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
                    Профиль помогает системе подобрать подходящие вакансии
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Чем точнее указаны район, навыки и формат работы, тем лучше
                    будет подбор вакансий.
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

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Новый профиль
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Данные для поиска работы
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Полное имя
              </span>
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Айбек Джаксыбеков"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="name@mail.kz"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Телефон
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="+7 700 000 0000"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Город
                </span>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
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

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Формат работы
                </span>
                <select
                  value={form.preferredJobType}
                  onChange={(e) =>
                    updateForm("preferredJobType", e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {employmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  value={form.expectedSalaryMin}
                  onChange={(e) =>
                    updateForm("expectedSalaryMin", e.target.value)
                  }
                  placeholder="80000"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Зарплата до
                </span>
                <input
                  type="number"
                  value={form.expectedSalaryMax}
                  onChange={(e) =>
                    updateForm("expectedSalaryMax", e.target.value)
                  }
                  placeholder="150000"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                О себе
              </span>
              <textarea
                value={form.bio}
                onChange={(e) => updateForm("bio", e.target.value)}
                rows={5}
                placeholder="Расскажите кратко о себе, учебе, опыте или желаемой работе..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-slate-700">
                Навыки
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
              onClick={createCandidate}
              disabled={submitting || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Создаём...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Создать профиль
                </>
              )}
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Профили соискателей
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Эти профили используются для откликов и умного подбора.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4" />
                Смотреть вакансии
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Sparkles className="h-4 w-4" />
                Подбор
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загружаем профили...
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Пока нет профилей
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Создайте первый профиль, чтобы начать откликаться на вакансии.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
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

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const skills = parseSkills(candidate.skills).slice(0, 6);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

            {candidate.isAvailable !== false && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Доступен
              </span>
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {candidate.user?.name || "Кандидат"}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{candidate.user?.phone || candidate.user?.email}</span>

            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {candidate.city || "Актау"}, {candidate.district || "район не указан"}
            </span>
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
            Подобрать вакансии
          </Link>
        </div>
      </div>
    </article>
  );
}