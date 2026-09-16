import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/admin/avaliacoes")({
  component: () => (
    <ComingSoon
      title="Avaliações"
      description="A montagem e a aplicação de provas entram na próxima etapa. A estrutura de dados já está pronta."
    />
  ),
});
