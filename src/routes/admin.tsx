import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Users,
  UserCheck,
  BarChart3,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";

const items: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Professores", to: "/admin/professores", icon: UserCheck },
  { label: "Cursos", to: "/admin/cursos", icon: BookOpen },
  { label: "Módulos", to: "/admin/modulos", icon: Layers },
  { label: "Turmas", to: "/admin/turmas", icon: GraduationCap },
  { label: "Alunos", to: "/admin/alunos", icon: Users },
  { label: "Matrículas", to: "/admin/matriculas", icon: ClipboardList },
  { label: "Avaliações", to: "/admin/avaliacoes", icon: ClipboardList },
  { label: "Relatórios", to: "/admin/relatorios", icon: BarChart3 },
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGate allow={["admin"]}>
      <AppShell items={items} areaLabel="Administração">
        <Outlet />
      </AppShell>
    </RoleGate>
  );
}
