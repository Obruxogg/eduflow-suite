import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/AuthContext";
import { useTeacherRecord } from "@/lib/teacher";

export const Route = createFileRoute("/professor/perfil")({
  component: TeacherProfilePage,
});

function TeacherProfilePage() {
  const { user, fullName, role } = useAuth();
  const teacher = useTeacherRecord();

  const rows = [
    { label: "Nome", value: teacher.data?.name ?? fullName ?? "—" },
    { label: "E-mail", value: teacher.data?.email ?? user?.email ?? "—" },
    { label: "Perfil de acesso", value: role === "admin" ? "Administrador" : "Professor" },
  ];

  return (
    <>
      <PageHeader title="Meu perfil" description="Seus dados cadastrais na instituição." />
      <Card className="max-w-xl">
        <CardContent className="divide-y divide-border p-0">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-muted-foreground">Situação</span>
            <StatusBadge status={teacher.data?.status ?? "active"} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
