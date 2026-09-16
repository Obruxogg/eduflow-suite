import { Construction } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon={Construction} title="Em preparação" description={description} />
    </>
  );
}
