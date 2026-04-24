"use client";

import Link from "next/link";
import { BriefcaseBusiness, MapPin, UserPlus } from "lucide-react";

const links = [
  { href: "/jobs", label: "Вакансии" },
  { href: "/jobs?view=map", label: "Карта" },
  { href: "/ai-match", label: "Подбор" },
  { href: "/candidate", label: "Соискателям" },
  { href: "/employer", label: "Работодателям" },
  { href: "/dashboard", label: "Кабинет" },
];

export function Navbar() {
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
            Создать профиль
          </Link>
        </div>
      </div>
    </header>
  );
}