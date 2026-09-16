import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError } from "@/lib/format";

export const Route = createFileRoute("/admin/matriculas")({
  component: EnrollmentsPage,
});

type Enrollment = {
  id: string;
  status: string;
  student_id: string;
  class_id: string;
  current_module_id: string | null;
};
type Student = { id: string; full_name: string };
type ClassRow = { id: string; name: string; course_id: string };
type ModuleRow = { id: string; name: string; course_id: string };
type Errors = Partial<Record<"studentId" | "classId", string>>;

const NO_MODULE = "none";

function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [moduleId, setModuleId] = useState(NO_MODULE);
  const [errors, setErrors] = useState<Errors>({});

  const students = useQuery({
    queryKey: ["students-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });

  const classes = useQuery({
    queryKey: ["classes-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, course_id")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
  });

  const modules = useQuery({
    queryKey: ["modules-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, name, course_id")
        .eq("status", "active")
        .order("order_index");
      if (error) throw error;
      return (data ?? []) as ModuleRow[];
    },
  });

  const enrollments = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, status, student_id, class_id, current_module_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Enrollment[];
    },
  });

  const selectedClass = classes.data?.find((c) => c.id === classId);
  const availableModules = useMemo(
    () => (modules.data ?? []).filter((m) => m.course_id === selectedClass?.course_id),
    [modules.data, selectedClass],
  );

  const studentName = (id: string) => students.data?.find((s) => s.id === id)?.full_name ?? "—";
  const className = (id: string) => classes.data?.find((c) => c.id === id)?.name ?? "—";
  const moduleName = (id: string | null) =>
    id ? (modules.data?.find((m) => m.id === id)?.name ?? "—") : "Não definido";

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enrollments").insert({
        student_id: studentId,
        class_id: classId,
        current_module_id: moduleId === NO_MODULE ? null : moduleId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Matrícula registrada.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (err) => toast.error(friendlyError(err, "Não foi possível registrar a matrícula.")),
  });

  const toggleStatus = useMutation({
    mutationFn: async (item: Enrollment) => {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: item.status === "active" ? "inactive" : "active" })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setStudentId("");
    setClassId("");
    setModuleId(NO_MODULE);
    setErrors({});
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!studentId) next.studentId = "Selecione o aluno.";
    if (!classId) next.classId = "Selecione a turma.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  const missingBase =
    !students.isLoading &&
    !classes.isLoading &&
    ((students.data?.length ?? 0) === 0 || (classes.data?.length ?? 0) === 0);

  return (
    <>
      <PageHeader
        title="Matrículas"
        description="Vincule alunos às turmas e indique o módulo atual."
        action={
          <Button onClick={openNew} disabled={missingBase}>
            <Plus className="size-4" /> Nova matrícula
          </Button>
        }
      />

      {missingBase ? (
        <EmptyState
          icon={ClipboardList}
          title="Cadastre alunos e turmas primeiro"
          description="A matrícula liga um aluno ativo a uma turma ativa."
        />
      ) : enrollments.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (enrollments.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma matrícula registrada ainda"
          description="Matricule os alunos nas turmas para acompanhar o desempenho."
          action={<Button onClick={openNew}>Registrar matrícula</Button>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Módulo atual</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{studentName(item.student_id)}</TableCell>
                  <TableCell className="text-muted-foreground">{className(item.class_id)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {moduleName(item.current_module_id)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
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
            <DialogTitle>Nova matrícula</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>Aluno</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.data?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId ? (
                <p className="text-xs text-destructive">{errors.studentId}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Turma</Label>
              <Select
                value={classId}
                onValueChange={(value) => {
                  setClassId(value);
                  setModuleId(NO_MODULE);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId ? <p className="text-xs text-destructive">{errors.classId}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Módulo atual</Label>
              <Select value={moduleId} onValueChange={setModuleId} disabled={!classId}>
                <SelectTrigger>
                  <SelectValue placeholder="Não definido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MODULE}>Não definido</SelectItem>
                  {availableModules.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Salvando…" : "Matricular"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
