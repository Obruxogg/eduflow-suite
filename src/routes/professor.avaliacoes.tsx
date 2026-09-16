import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/professor/avaliacoes")({
  component: () => (
    <ComingSoon
      title="Avaliações"
      description="Nenhuma avaliação cadastrada ainda. A criação de provas será liberada na próxima etapa."
    />
  ),
});
