import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap, ClipboardCheck, BarChart3 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Provas Digitais — Gestão acadêmica e avaliação de desempenho" },
      {
        name: "description",
        content:
          "Cadastre cursos, módulos, turmas, professores e alunos e acompanhe o desempenho em provas digitais.",
      },
      { property: "og:title", content: "Provas Digitais — Gestão acadêmica e avaliação" },
      {
        property: "og:description",
        content: "Cursos, turmas, alunos e provas digitais em uma plataforma única.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, role, authLoading, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || roleLoading || !user) return;
    if (role === "admin") void navigate({ to: "/admin", replace: true });
    if (role === "professor") void navigate({ to: "/professor", replace: true });
  }, [authLoading, roleLoading, user, role, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              PD
            </span>
            <span className="font-semibold">Provas Digitais</span>
          </div>
          <Button asChild size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
          Gestão acadêmica e avaliação de desempenho em uma plataforma só
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Organize cursos, módulos, turmas, professores e alunos, e prepare as avaliações digitais
          da sua instituição.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/login">Acessar o sistema</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/setup">Configuração inicial</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { icon: GraduationCap, title: "Cadastros completos", text: "Cursos, módulos, turmas, professores, alunos e matrículas." },
            { icon: ClipboardCheck, title: "Provas digitais", text: "Estrutura pronta para avaliações, questões e tentativas." },
            { icon: BarChart3, title: "Desempenho", text: "Base para acompanhar resultados por turma e por aluno." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <item.icon className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
