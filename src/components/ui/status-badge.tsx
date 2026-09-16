import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-secondary text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-current" : "bg-current opacity-60")} />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}
