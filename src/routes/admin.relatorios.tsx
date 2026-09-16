import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/admin/relatorios")({
  component: () => (
    <ComingSoon
      title="Relatórios"
      description="Os relatórios de desempenho serão liberados após a aplicação das primeiras provas."
    />
  ),
});
