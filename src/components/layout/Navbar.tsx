"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  LogOut,
  MapPin,
  Sparkles,
  UserCircle2,
  UserPlus,
} from "lucide-react";

type Role = "candidate" | "employer" | "admin";

type Session = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const SESSION_KEY = "mj_session";

const publicLinks = [
  { href: "/", label: "Главная" },
  { href: "/jobs", label: "Вакансии" },
  { href: "/workers", label: "Работники" },
  { href: "/map", label: "Карта" },
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

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function Navbar() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(readSession());

    function syncSession() {
      setSession(readSession());
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener("mj-auth-change", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("mj-auth-change", syncSession);
    };
  }, []);

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    clearCookie("mj_role");
    clearCookie("mj_admin");

    window.dispatchEvent(new Event("mj-auth-change"));
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight text-slate-950">
              Mangystau<span className="text-blue-600">Jobs</span>
            </div>
            <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
              <MapPin className="h-3 w-3" />
              Локальная платформа занятости
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}

          {session && (
            <Link
              href="/ai-match"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950 transition hover:text-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              Подбор
            </Link>
          )}

          {session && (session.role === "employer" || session.role === "admin") && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-950 transition hover:text-blue-600"
            >
              Отклики
            </Link>
          )}

          {session && (
            <Link
              href="/account"
              className="text-sm font-semibold text-slate-950 transition hover:text-blue-600"
            >
              Кабинет
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!session ? (
            <>
              <Link
                href="/login?mode=login"
                className="hidden text-sm font-semibold text-slate-600 transition hover:text-slate-950 sm:inline"
              >
                Войти
              </Link>

              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Регистрация
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              >
                <UserCircle2 className="h-4 w-4" />
                {session.name}
              </Link>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}