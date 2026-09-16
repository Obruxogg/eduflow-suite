import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime } from "@/lib/format";
import { useTeacherClasses, useTeacherRecord } from "@/lib/teacher";

export const Route = createFileRoute("/professor/turmas")({
  component: TeacherClassesPage,
});

function TeacherClassesPage() {
  const teacher = useTeacherRecord();
  const classes = useTeacherClasses(teacher.data?.id);

  return (
    <>
      <PageHeader title="Minhas turmas" description="Turmas atribuídas a você." />

      {teacher.isLoading || classes.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (classes.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma atribuída ainda"
          description="Assim que a administração vincular você a uma turma, ela aparecerá aqui."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Encontro</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.day_of_week} · {formatTime(item.start_time)}–{formatTime(item.end_time)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
