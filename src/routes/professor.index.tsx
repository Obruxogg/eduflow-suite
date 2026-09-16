import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, GraduationCap, CheckSquare } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeacherClasses, useTeacherRecord } from "@/lib/teacher";

export const Route = createFileRoute("/professor/")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const teacher = useTeacherRecord();
  const classes = useTeacherClasses(teacher.data?.id);

  const cards = [
    { label: "Minhas turmas", value: classes.data?.length ?? 0, icon: GraduationCap },
    { label: "Avaliações criadas", value: 0, icon: ClipboardList },
    { label: "Correções pendentes", value: 0, icon: CheckSquare },
  ];

  return (
    <>
      <PageHeader
        title={`Olá, ${teacher.data?.name ?? "professor(a)"}`}
        description="Resumo da sua atuação na instituição."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma avaliação cadastrada ainda"
          description="A criação de provas digitais será liberada na próxima etapa do sistema."
        />
      </div>
    </>
  );
}
