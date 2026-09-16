import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useAuth, type AppRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

function FullScreenMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
          <ShieldAlert className="size-6 text-primary" />
        </span>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}

export function RoleGate({
  allow,
  children,
}: {
  allow: Exclude<AppRole, null>[];
  children: ReactNode;
}) {
  const { user, role, authLoading, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      void navigate({ to: "/login", replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!user) return null;

  if (!role) {
    return (
      <FullScreenMessage
        title="Acesso ainda não configurado"
        description="Sua conta não possui um perfil de acesso definido. Peça a um administrador para liberar seu acesso."
        action={
          <Button asChild variant="outline">
            <Link to="/login">Voltar ao login</Link>
          </Button>
        }
      />
    );
  }

  if (!allow.includes(role)) {
    return (
      <FullScreenMessage
        title="Permissão insuficiente"
        description="Você não tem permissão para acessar esta área do sistema."
        action={
          <Button asChild>
            <Link to={role === "admin" ? "/admin" : "/professor"}>Ir para a minha área</Link>
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
