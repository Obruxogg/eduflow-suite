import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
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
import { friendlyError } from "@/lib/format";

export const Route = createFileRoute("/admin/cursos")({
  component: CoursesPage,
});

type Course = { id: string; name: string; status: string };

function CoursesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("courses")
        .select("id, name, status")
        .order("name");
      if (queryError) throw queryError;
      return (data ?? []) as Course[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error: e } = await supabase.from("courses").update({ name }).eq("id", editing.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("courses").insert({ name });
        if (e) throw e;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Curso atualizado." : "Curso cadastrado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const toggleStatus = useMutation({
    mutationFn: async (course: Course) => {
      const { error: e } = await supabase
        .from("courses")
        .update({ status: course.status === "active" ? "inactive" : "active" })
        .eq("id", course.id);
      if (e) throw e;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setEditing(null);
    setName("");
    setError("");
    setOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setName(course.name);
    setError("");
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("Informe um nome com ao menos 3 caracteres.");
      return;
    }
    setError("");
    save.mutate();
  }

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Cadastre os cursos oferecidos pela instituição."
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Novo curso
          </Button>
        }
      />

      {courses.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (courses.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum curso cadastrado ainda"
          description="Cadastre o primeiro curso para depois criar módulos e turmas."
          action={<Button onClick={openNew}>Cadastrar curso</Button>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.data?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={course.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(course)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate(course)}
                      disabled={toggleStatus.isPending}
                    >
                      {course.status === "active" ? "Inativar" : "Ativar"}
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
            <DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="course-name">Nome do curso</Label>
              <Input
                id="course-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Técnico em Informática"
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
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
