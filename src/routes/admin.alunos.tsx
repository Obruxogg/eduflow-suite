import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError, isValidCpf, maskCpf, onlyDigits } from "@/lib/format";

export const Route = createFileRoute("/admin/alunos")({
  component: StudentsPage,
});

type Student = { id: string; full_name: string; cpf: string; status: string };
type Errors = Partial<Record<"fullName" | "cpf", string>>;

function StudentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const students = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, cpf, status")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { full_name: fullName.trim(), cpf: onlyDigits(cpf) };
      if (editing) {
        const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Aluno atualizado." : "Aluno cadastrado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["students"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (err) => toast.error(friendlyError(err, "Não foi possível salvar o aluno.")),
  });

  const toggleStatus = useMutation({
    mutationFn: async (item: Student) => {
      const { error } = await supabase
        .from("students")
        .update({ status: item.status === "active" ? "inactive" : "active" })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setEditing(null);
    setFullName("");
    setCpf("");
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: Student) {
    setEditing(item);
    setFullName(item.full_name);
    setCpf(maskCpf(item.cpf));
    setErrors({});
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (fullName.trim().length < 3) next.fullName = "Informe o nome completo.";
    if (!isValidCpf(cpf)) next.cpf = "Informe um CPF válido.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  return (
    <>
      <PageHeader
        title="Alunos"
        description="Cadastro dos alunos da instituição."
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Novo aluno
          </Button>
        }
      />

      {students.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (students.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno cadastrado ainda"
          description="Cadastre alunos para depois matriculá-los em turmas."
          action={<Button onClick={openNew}>Cadastrar aluno</Button>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{maskCpf(item.cpf)}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate(item)}
                      disabled={toggleStatus.isPending}
                    >
                      {item.status === "active" ? "Inativar" : "Ativar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="student-name">Nome completo</Label>
              <Input
                id="student-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="student-cpf">CPF</Label>
              <Input
                id="student-cpf"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
              />
              {errors.cpf ? <p className="text-xs text-destructive">{errors.cpf}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
