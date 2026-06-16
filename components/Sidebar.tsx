"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, Home, TrendingUp } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/learn", icon: BookOpen, label: "Aprender" },
  { href: "/invest", icon: BarChart2, label: "Invertir" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 h-screen sticky top-0 py-6 px-4 shrink-0"
        style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-2 mb-10 px-2">
          <TrendingUp size={20} style={{ color: "var(--accent-green)" }} />
          <span
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "var(--text-primary)" }}
          >
            Finicia
          </span>
          <span
            className="ml-1 mt-1 w-2 h-2 rounded-full inline-block"
            style={{ background: "var(--accent-green)", animation: "pulse-dot 2s ease-in-out infinite" }}
          />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-surface)" : "transparent",
                  borderLeft: active ? `2px solid var(--accent-purple)` : "2px solid transparent",
                }}
              >
                <Icon size={17} style={{ color: active ? "var(--accent-purple)" : "var(--text-secondary)" }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <div className="surface p-3 rounded-lg">
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-gold)" }}>Datos de mercado</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Yahoo Finance + FMP · IA por Claude</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden flex justify-around py-3 z-50"
        style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1">
              <Icon size={20} style={{ color: active ? "var(--accent-purple)" : "var(--text-secondary)" }} />
              <span className="text-xs" style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
