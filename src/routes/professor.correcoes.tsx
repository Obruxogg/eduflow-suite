import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/professor/correcoes")({
  component: () => (
    <ComingSoon
      title="Correções"
      description="Nenhuma correção pendente. As respostas dissertativas aparecerão aqui após as primeiras provas."
    />
  ),
});
