import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; to: string; icon: LucideIcon };

export function AppShell({
  items,
  areaLabel,
  children,
}: {
  items: NavItem[];
  areaLabel: string;
  children: ReactNode;
}) {
  const { fullName, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    pathname === to || (to !== items[0]?.to && pathname.startsWith(`${to}/`));

  const initials = (fullName || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            PD
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Provas Digitais</p>
            <p className="text-xs text-sidebar-foreground/70">{areaLabel}</p>
          </div>
          <button
            className="ml-auto md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fullName || "Usuário"}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <p className="text-sm font-medium text-muted-foreground">
            Sistema de Provas Digitais e Avaliação de Desempenho
          </p>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
