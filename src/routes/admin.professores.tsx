import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, UserCheck } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { createTeacherWithAccess } from "@/lib/auth.functions";
import { friendlyError } from "@/lib/format";

export const Route = createFileRoute("/admin/professores")({
  component: TeachersPage,
});

type Teacher = { id: string; name: string; email: string; status: string };
type Errors = Partial<Record<"name" | "email" | "password", string>>;

function TeachersPage() {
  const queryClient = useQueryClient();
  const createTeacher = useServerFn(createTeacherWithAccess);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const teachers = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, email, status")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Teacher[];
    },
  });

  const save = useMutation({
    mutationFn: async () =>
      createTeacher({ data: { name: name.trim(), email: email.trim(), password } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["teachers"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (err) => toast.error(friendlyError(err, "Não foi possível cadastrar o professor.")),
  });

  const toggleStatus = useMutation({
    mutationFn: async (teacher: Teacher) => {
      const { error } = await supabase
        .from("teachers")
        .update({ status: teacher.status === "active" ? "inactive" : "active" })
        .eq("id", teacher.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["teachers"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 3) next.name = "Informe o nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Informe um e-mail válido.";
    if (password.length < 8) next.password = "A senha deve ter ao menos 8 caracteres.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  return (
    <>
      <PageHeader
        title="Professores"
        description="Cadastre professores e libere o acesso ao painel."
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Novo professor
          </Button>
        }
      />

      {teachers.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (teachers.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Nenhum professor cadastrado ainda"
          description="Ao cadastrar um professor, o acesso ao painel é criado automaticamente."
          action={<Button onClick={openNew}>Cadastrar professor</Button>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.data?.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={teacher.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate(teacher)}
                      disabled={toggleStatus.isPending}
                    >
                      {teacher.status === "active" ? "Inativar" : "Ativar"}
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
            <DialogTitle>Novo professor</DialogTitle>
            <DialogDescription>
              Defina uma senha inicial e informe-a ao professor de forma segura.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="teacher-name">Nome completo</Label>
              <Input id="teacher-name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacher-email">E-mail</Label>
              <Input
                id="teacher-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacher-password">Senha inicial</Label>
              <Input
                id="teacher-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Cadastrando…" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
