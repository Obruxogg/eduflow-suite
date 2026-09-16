import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/professor/resultados")({
  component: () => (
    <ComingSoon
      title="Resultados"
      description="Ainda não há resultados. Os desempenhos por turma e por aluno aparecerão aqui."
    />
  ),
});
