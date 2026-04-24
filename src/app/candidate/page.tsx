"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";

type Session = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  createdAt: string;
};

type CandidateProfile = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  city: string;
  district: string;
  bio: string;
  skills: string;
  experienceLevel: string;
  preferredJobType: string;
  preferredType: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  isAvailable: boolean;
  createdAt: string;
};

const SESSION_KEY = "mj_session";
const PUBLIC_CANDIDATES_KEY = "mj_public_candidates";

const districts = [
  "Микрорайон 1",
  "Микрорайон 5",
  "Микрорайон 7",
  "Микрорайон 12",
  "Микрорайон 27",
  "Промзона",
  "Центр",
];

const skillsList = [
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

const experienceOptions = [
  { value: "NO_EXPERIENCE", label: "Без опыта" },
  { value: "JUNIOR", label: "Начинающий" },
  { value: "MIDDLE", label: "Средний опыт" },
  { value: "SENIOR", label: "Опытный" },
];

const employmentOptions = [
  { value: "PART_TIME", label: "Подработка" },
  { value: "FULL_TIME", label: "Полная занятость" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "CONTRACT", label: "Контракт" },
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

function getProfileKey(sessionId: string) {
  return `mj_candidate_profile_${sessionId}`;
}

function readPublicCandidates(): CandidateProfile[] {
  try {
    const raw = localStorage.getItem(PUBLIC_CANDIDATES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function upsertPublicCandidate(profile: CandidateProfile) {
  const candidates = readPublicCandidates();
  const next = [
    profile,
    ...candidates.filter((candidate) => candidate.id !== profile.id),
  ];

  localStorage.setItem(PUBLIC_CANDIDATES_KEY, JSON.stringify(next));
}

export default function CandidatePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Актау");
  const [district, setDistrict] = useState("Микрорайон 7");
  const [experienceLevel, setExperienceLevel] = useState("NO_EXPERIENCE");
  const [preferredJobType, setPreferredJobType] = useState("PART_TIME");
  const [expectedSalaryMin, setExpectedSalaryMin] = useState("80000");
  const [expectedSalaryMax, setExpectedSalaryMax] = useState("150000");
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Ответственность",
    "Коммуникабельность",
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const current = readSession();

    if (!current) {
      window.location.href = "/login?mode=login";
      return;
    }

    if (current.role !== "candidate") {
      window.location.href = "/account";
      return;
    }

    setSession(current);

    const saved = localStorage.getItem(getProfileKey(current.id));

    if (saved) {
      try {
        const profile: CandidateProfile = JSON.parse(saved);
        setPhone(profile.user.phone || "");
        setCity(profile.city || "Актау");
        setDistrict(profile.district || "Микрорайон 7");
        setExperienceLevel(profile.experienceLevel || "NO_EXPERIENCE");
        setPreferredJobType(
          profile.preferredJobType || profile.preferredType || "PART_TIME"
        );
        setExpectedSalaryMin(String(profile.expectedSalaryMin || 80000));
        setExpectedSalaryMax(String(profile.expectedSalaryMax || 150000));
        setBio(profile.bio || "");
        setSelectedSkills(
          profile.skills
            ? profile.skills.split(",").map((item) => item.trim()).filter(Boolean)
            : ["Ответственность", "Коммуникабельность"]
        );
        setIsAvailable(profile.isAvailable !== false);
      } catch {
        // ignore broken local profile
      }
    }

    setChecking(false);
  }, []);

  const previewSkills = useMemo(() => selectedSkills.slice(0, 6), [selectedSkills]);

  function toggleSkill(skill: string) {
    setSelectedSkills((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return [...current, skill];
    });
  }

  function addCustomSkill() {
    const value = customSkill.trim();

    if (!value) return;

    if (!selectedSkills.includes(value)) {
      setSelectedSkills((current) => [...current, value]);
    }

    setCustomSkill("");
  }

  function createProfile() {
    setError("");
    setSuccess("");

    if (!session) {
      setError("Сначала войдите в аккаунт.");
      return;
    }

    if (!phone.trim()) {
      setError("Введите номер телефона.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Выберите хотя бы один навык.");
      return;
    }

    const min = Number(expectedSalaryMin);
    const max = Number(expectedSalaryMax);

    if (!min || !max || min > max) {
      setError("Проверьте ожидаемую зарплату.");
      return;
    }

    const profile: CandidateProfile = {
      id: `candidate-${session.id}`,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        phone: phone.trim(),
      },
      city,
      district,
      bio:
        bio.trim() ||
        "Открыт к предложениям работы в Мангистау. Готов пройти собеседование и быстро приступить к задачам.",
      skills: selectedSkills.join(", "),
      experienceLevel,
      preferredJobType,
      preferredType: preferredJobType,
      expectedSalaryMin: min,
      expectedSalaryMax: max,
      isAvailable,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(getProfileKey(session.id), JSON.stringify(profile));

    if (isAvailable) {
      upsertPublicCandidate(profile);
    }

    window.dispatchEvent(new Event("mj-auth-change"));
    setSuccess("Профиль сохранён. Теперь он доступен в личном кабинете и списке работников.");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем профиль...
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
            <UserRound className="h-4 w-4" />
            Кабинет соискателя
          </div>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Создайте профиль работника
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Укажите район, навыки, опыт и желаемый формат работы. После
                сохранения профиль можно показывать работодателям.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/workers"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Работники
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/ai-match"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4" />
                Найти вакансии
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr] lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Личная информация
          </h2>

          <div className="mt-6 grid gap-4">
            <label>
              <span className="text-sm font-medium text-slate-700">Имя</span>
              <input
                value={session.name}
                disabled
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                value={session.email}
                disabled
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">
                Телефон
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 700 000 0000"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Город
                </span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Район
                </span>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Тип работы
                </span>
                <select
                  value={preferredJobType}
                  onChange={(event) => setPreferredJobType(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                >
                  {employmentOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Опыт
                </span>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Зарплата от
                </span>
                <input
                  type="number"
                  value={expectedSalaryMin}
                  onChange={(event) => setExpectedSalaryMin(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-700">
                  Зарплата до
                </span>
                <input
                  type="number"
                  value={expectedSalaryMax}
                  onChange={(event) => setExpectedSalaryMax(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <label>
              <span className="text-sm font-medium text-slate-700">О себе</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Например: ищу подработку после учебы, быстро обучаюсь..."
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div>
              <div className="text-sm font-medium text-slate-700">Навыки</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {skillsList.map((skill) => {
                  const active = selectedSkills.includes(skill);

                  return (
                    <button
                      key={skill}
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

              <div className="mt-4 flex gap-2">
                <input
                  value={customSkill}
                  onChange={(event) => setCustomSkill(event.target.value)}
                  placeholder="Добавить свой навык"
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />

                <button
                  onClick={addCustomSkill}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) => setIsAvailable(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950">
                  Показывать профиль работодателям
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  Профиль появится на странице “Работники”.
                </span>
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <button
              onClick={createProfile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Сохранить профиль
            </button>
          </div>
        </div>

        <div className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Как профиль будет выглядеть
          </h2>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <UserRound className="h-5 w-5" />
            </div>

            <h3 className="mt-5 text-2xl font-bold text-slate-950">
              {session.name}
            </h3>

            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {city}, {district}
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {bio ||
                "Краткое описание появится здесь после заполнения поля “О себе”."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {previewSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4">
              <div className="text-sm text-slate-500">Ожидаемая зарплата</div>
              <div className="mt-1 text-lg font-bold text-slate-950">
                {Number(expectedSalaryMin || 0).toLocaleString("ru-RU")}–
                {Number(expectedSalaryMax || 0).toLocaleString("ru-RU")} ₸
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}