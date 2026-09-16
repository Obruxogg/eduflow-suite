import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Users, UserCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

async function countRows(table: "teachers" | "students" | "classes" | "courses", activeOnly: boolean) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (activeOnly) query = query.eq("status", "active");
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function AdminDashboard() {
  const metrics = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => ({
      teachers: await countRows("teachers", true),
      students: await countRows("students", false),
      classes: await countRows("classes", false),
      courses: await countRows("courses", false),
    }),
  });

  const cards = [
    { label: "Professores ativos", value: metrics.data?.teachers, icon: UserCheck },
    { label: "Alunos cadastrados", value: metrics.data?.students, icon: Users },
    { label: "Turmas", value: metrics.data?.classes, icon: GraduationCap },
    { label: "Cursos", value: metrics.data?.courses, icon: BookOpen },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos cadastros da instituição."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {metrics.isLoading ? "—" : (card.value ?? 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!metrics.isLoading &&
      metrics.data &&
      Object.values(metrics.data).every((value) => value === 0) ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <h2 className="text-base font-semibold">Nenhum cadastro ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece cadastrando um curso, depois os módulos, as turmas e os professores.
          </p>
        </div>
      ) : null}
    </>
  );
}
