import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyError } from "@/lib/format";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Sistema de Provas Digitais" },
      { name: "description", content: "Acesse o painel administrativo ou o painel do professor." },
      { property: "og:title", content: "Entrar — Sistema de Provas Digitais" },
      { property: "og:description", content: "Acesso para administradores e professores." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, role, authLoading, roleLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (authLoading || roleLoading || !user) return;
    if (role === "admin") void navigate({ to: "/admin", replace: true });
    else if (role === "professor") void navigate({ to: "/professor", replace: true });
  }, [authLoading, roleLoading, user, role, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Informe um e-mail válido.";
    if (password.length < 6) nextErrors.password = "Informe sua senha.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyError(error, "Não foi possível entrar."));
      return;
    }
    toast.success("Bem-vindo de volta!");
  }

  if (user && (role === "admin" || role === "professor")) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            PD
          </span>
          <h1 className="text-xl font-semibold text-foreground">Entrar no sistema</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use suas credenciais institucionais.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@instituicao.edu.br"
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Primeiro acesso da instituição?{" "}
          <Link to="/setup" className="font-medium text-primary underline-offset-2 hover:underline">
            Configuração inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
