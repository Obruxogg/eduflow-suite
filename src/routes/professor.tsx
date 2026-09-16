import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  User,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";

const items: NavItem[] = [
  { label: "Dashboard", to: "/professor", icon: LayoutDashboard },
  { label: "Minhas Turmas", to: "/professor/turmas", icon: GraduationCap },
  { label: "Avaliações", to: "/professor/avaliacoes", icon: ClipboardList },
  { label: "Correções", to: "/professor/correcoes", icon: CheckSquare },
  { label: "Resultados", to: "/professor/resultados", icon: BarChart3 },
  { label: "Meu Perfil", to: "/professor/perfil", icon: User },
];

export const Route = createFileRoute("/professor")({
  ssr: false,
  component: TeacherLayout,
});

function TeacherLayout() {
  return (
    <RoleGate allow={["professor", "admin"]}>
      <AppShell items={items} areaLabel="Área do professor">
        <Outlet />
      </AppShell>
    </RoleGate>
  );
}
