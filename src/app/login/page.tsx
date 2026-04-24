"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type Mode = "login" | "register";
type PublicRole = "candidate" | "employer";
type Role = PublicRole | "admin";

type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: PublicRole;
  createdAt: string;
};

type Session = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const ACCOUNTS_KEY = "mj_accounts";
const SESSION_KEY = "mj_session";

const ADMIN_EMAIL = "admin@mangystaujobs.kz";
const ADMIN_PASSWORD = "admin12345";
const ADMIN_ACCESS_CODE = "MANGYSTAU-ADMIN";

const publicRoles: {
  id: PublicRole;
  title: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    id: "candidate",
    title: "Я ищу работу",
    description: "Создать профиль, смотреть вакансии и получать подбор.",
    icon: UserRound,
  },
  {
    id: "employer",
    title: "Я работодатель",
    description: "Размещать вакансии, смотреть отклики и искать кандидатов.",
    icon: Building2,
  },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readAccounts(): Account[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=604800; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setCookie("mj_role", session.role);

  if (session.role === "admin") {
    setCookie("mj_admin", "true");
  } else {
    clearCookie("mj_admin");
  }

  window.dispatchEvent(new Event("mj-auth-change"));
}

function seedDemoAccounts() {
  const existing = readAccounts();

  const demoAccounts: Account[] = [
    {
      id: "demo-candidate",
      name: "Айбек Джаксыбеков",
      email: "candidate@mangystaujobs.kz",
      password: "password123",
      role: "candidate",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-employer",
      name: "Caspian Logistics",
      email: "employer@mangystaujobs.kz",
      password: "password123",
      role: "employer",
      createdAt: new Date().toISOString(),
    },
  ];

  const merged = [...existing];

  for (const demo of demoAccounts) {
    const exists = merged.some(
      (account) => account.email.toLowerCase() === demo.email.toLowerCase()
    );

    if (!exists) {
      merged.push(demo);
    }
  }

  saveAccounts(merged);
}

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<PublicRole>("candidate");
  const [adminMode, setAdminMode] = useState(false);

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adminCode, setAdminCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedRole = useMemo(() => {
    return publicRoles.find((item) => item.id === role) || publicRoles[0];
  }, [role]);

  useEffect(() => {
    seedDemoAccounts();

    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get("mode");
    const queryRole = params.get("role");
    const admin = params.get("admin");

    if (queryMode === "login" || queryMode === "register") {
      setMode(queryMode);
    }

    if (queryRole === "candidate" || queryRole === "employer") {
      setRole(queryRole);
    }

    if (admin === "1") {
      setMode("login");
      setAdminMode(true);
    }
  }, []);

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function switchMode(nextMode: Mode) {
    resetMessages();
    setMode(nextMode);

    if (nextMode === "register") {
      setAdminMode(false);
    }
  }

  function validateBaseFields() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Введите email и пароль.");
      return false;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Введите корректный email.");
      return false;
    }

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов.");
      return false;
    }

    return true;
  }

  function handleRegister() {
    resetMessages();

    if (!validateBaseFields()) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "candidate" && !name.trim()) {
      setError("Введите имя соискателя.");
      return;
    }

    if (role === "employer" && !companyName.trim()) {
      setError("Введите название компании.");
      return;
    }

    const accounts = readAccounts();

    const exists = accounts.some(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (exists) {
      setError("Аккаунт с таким email уже существует. Войдите в аккаунт.");
      return;
    }

    const account: Account = {
      id: crypto.randomUUID(),
      name: role === "candidate" ? name.trim() : companyName.trim(),
      email: normalizedEmail,
      password,
      role,
      createdAt: new Date().toISOString(),
    };

    saveAccounts([...accounts, account]);

    saveSession({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      createdAt: new Date().toISOString(),
    });

    setSuccess("Аккаунт создан. Переходим в кабинет...");
    router.push("/account");
  }

  function handleLogin() {
    resetMessages();

    if (!validateBaseFields()) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (adminMode) {
      const isCorrectAdmin =
        normalizedEmail === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD &&
        adminCode.trim() === ADMIN_ACCESS_CODE;

      if (!isCorrectAdmin) {
        setError("Неверные данные администратора.");
        return;
      }

      saveSession({
        id: "admin",
        name: "Platform Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      setSuccess("Вход администратора выполнен.");
      router.push("/admin");
      return;
    }

    const accounts = readAccounts();

    const account = accounts.find((item) => {
      return (
        item.email.toLowerCase() === normalizedEmail &&
        item.password === password &&
        item.role === role
      );
    });

    if (!account) {
      setError(
        "Неверный email, пароль или выбранная роль. Проверьте данные и попробуйте снова."
      );
      return;
    }

    saveSession({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      createdAt: new Date().toISOString(),
    });

    setSuccess("Вход выполнен. Переходим в кабинет...");
    router.push("/account");
  }

  function handleSubmit() {
    if (mode === "register") {
      handleRegister();
    } else {
      handleLogin();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-slate-950">
                Mangystau<span className="text-blue-600">Jobs</span>
              </div>
              <div className="text-sm text-slate-500">
                Локальная платформа занятости
              </div>
            </div>
          </Link>

          <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <LockKeyhole className="h-4 w-4" />
            {adminMode
              ? "Административный доступ"
              : mode === "login"
                ? "Вход в аккаунт"
                : "Регистрация"}
          </div>

          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-slate-950">
            {adminMode
              ? "Вход для администратора платформы"
              : mode === "login"
                ? "Войдите в свой кабинет"
                : "Создайте аккаунт для работы с платформой"}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            {adminMode
              ? "Админ-доступ скрыт от обычных пользователей и используется только для модерации работодателей и вакансий."
              : mode === "login"
                ? "Выберите роль, введите email и пароль. После входа вы попадёте в личный кабинет."
                : "Выберите роль: соискатель или работодатель. Админ-аккаунты не создаются через публичную регистрацию."}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <InfoCard value="Карта" label="вакансий рядом" />
            <InfoCard value="Подбор" label="по навыкам и району" />
            <InfoCard value="Проверка" label="работодателей" />
          </div>

          {!adminMode && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-950">
                Тестовые аккаунты
              </div>

              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <div>
                  Соискатель:{" "}
                  <span className="font-semibold text-slate-900">
                    candidate@mangystaujobs.kz
                  </span>{" "}
                  / password123
                </div>

                <div>
                  Работодатель:{" "}
                  <span className="font-semibold text-slate-900">
                    employer@mangystaujobs.kz
                  </span>{" "}
                  / password123
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
          {!adminMode && (
            <div className="grid rounded-[1.5rem] bg-slate-100 p-1 sm:grid-cols-2">
              <button
                onClick={() => switchMode("login")}
                className={`rounded-[1.25rem] px-5 py-3 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                Войти
              </button>

              <button
                onClick={() => switchMode("register")}
                className={`rounded-[1.25rem] px-5 py-3 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                Регистрация
              </button>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {adminMode
                ? "Вход администратора"
                : mode === "login"
                  ? "Вход"
                  : "Создание аккаунта"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {adminMode
                ? "Введите admin email, пароль и код доступа."
                : mode === "login"
                  ? "Выберите роль и введите данные аккаунта."
                  : "Публичная регистрация доступна только для соискателей и работодателей."}
            </p>

            {!adminMode && (
              <div className="mt-6 grid gap-3">
                {publicRoles.map((item) => {
                  const Icon = item.icon;
                  const active = role === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        resetMessages();
                        setRole(item.id);
                      }}
                      className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-950">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-500">
                          {item.description}
                        </div>
                      </div>

                      {active && (
                        <CheckCircle2 className="mt-2 h-5 w-5 shrink-0 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {mode === "register" && !adminMode && (
              <label className="mt-6 block">
                <span className="text-sm font-medium text-slate-700">
                  {role === "employer" ? "Название компании" : "Полное имя"}
                </span>

                <input
                  value={role === "employer" ? companyName : name}
                  onChange={(event) =>
                    role === "employer"
                      ? setCompanyName(event.target.value)
                      : setName(event.target.value)
                  }
                  placeholder={
                    role === "employer" ? "Caspian Logistics" : "Айбек"
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={adminMode ? ADMIN_EMAIL : "name@mail.kz"}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Пароль
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            {adminMode && (
              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">
                  Admin access code
                </span>

                <input
                  value={adminCode}
                  onChange={(event) => setAdminCode(event.target.value)}
                  placeholder="Введите код доступа"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
                />
              </label>
            )}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {adminMode
                ? "Войти как администратор"
                : mode === "login"
                  ? "Войти"
                  : "Создать аккаунт"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                  {adminMode ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <selectedRole.icon className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-950">
                    {adminMode
                      ? "Административный доступ"
                      : `Выбранная роль: ${selectedRole.title}`}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {adminMode
                      ? "Админ может модерировать работодателей и вакансии."
                      : selectedRole.description}
                  </p>
                </div>
              </div>
            </div>

            {mode === "login" && (
              <button
                onClick={() => {
                  resetMessages();
                  setAdminMode((prev) => !prev);
                  setPassword("");
                  setAdminCode("");
                }}
                className="mt-5 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                {adminMode
                  ? "Вернуться к обычному входу"
                  : "Вход администратора"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}