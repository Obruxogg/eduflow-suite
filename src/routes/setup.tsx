import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { bootstrapFirstAdmin, getSetupStatus } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyError } from "@/lib/format";

export const Route = createFileRoute("/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configuração inicial — Sistema de Provas Digitais" },
      {
        name: "description",
        content: "Crie o primeiro administrador da instituição para começar a usar o sistema.",
      },
      { property: "og:title", content: "Configuração inicial — Provas Digitais" },
      { property: "og:description", content: "Cadastro do primeiro administrador." },
    ],
  }),
  component: SetupPage,
});

type FieldErrors = Partial<Record<"fullName" | "email" | "password" | "confirm", string>>;

function SetupPage() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getSetupStatus);
  const bootstrapFn = useServerFn(bootstrapFirstAdmin);

  const status = useQuery({
    queryKey: ["setup-status"],
    queryFn: () => statusFn({}),
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (fullName.trim().length < 3) next.fullName = "Informe o nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Informe um e-mail válido.";
    if (password.length < 8) next.password = "A senha deve ter ao menos 8 caracteres.";
    if (password !== confirm) next.confirm = "As senhas não coincidem.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const result = await bootstrapFn({
        data: { fullName: fullName.trim(), email: email.trim(), password },
      });
      if (!result.ok) {
        toast.error(result.message);
        await status.refetch();
        return;
      }
      toast.success("Administrador criado. Faça login para continuar.");
      void navigate({ to: "/login" });
    } catch (error) {
      toast.error(friendlyError(error, "Não foi possível concluir a configuração."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        {status.isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Verificando configuração…</p>
        ) : status.isError ? (
          <div className="text-center">
            <h1 className="text-lg font-semibold">Não foi possível verificar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente novamente em alguns instantes.
            </p>
            <Button className="mt-5" onClick={() => void status.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : status.data?.adminExists ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 text-lg font-semibold">Configuração já concluída</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta instituição já possui um administrador cadastrado. Novos administradores devem
              ser criados dentro do painel administrativo.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/login">Ir para o login</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold">Configuração inicial</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre o primeiro administrador do sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                {errors.fullName ? (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {errors.confirm ? <p className="text-xs text-destructive">{errors.confirm}</p> : null}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Criando…" : "Criar administrador"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
