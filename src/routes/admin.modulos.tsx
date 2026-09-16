import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/admin/modulos")({
  component: ModulesPage,
});

type Course = { id: string; name: string };
type Module = {
  id: string;
  name: string;
  order_index: number;
  status: string;
  course_id: string;
};
type Errors = Partial<Record<"name" | "courseId", string>>;

function ModulesPage() {
  const queryClient = useQueryClient();
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [errors, setErrors] = useState<Errors>({});

  const courses = useQuery({
    queryKey: ["courses-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name").order("name");
      if (error) throw error;
      return (data ?? []) as Course[];
    },
  });

  const modules = useQuery({
    queryKey: ["modules", filterCourse],
    queryFn: async () => {
      let query = supabase
        .from("modules")
        .select("id, name, order_index, status, course_id")
        .order("order_index");
      if (filterCourse !== "all") query = query.eq("course_id", filterCourse);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Module[];
    },
  });

  const courseName = (id: string) => courses.data?.find((c) => c.id === id)?.name ?? "—";

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        course_id: courseId,
        order_index: Number(orderIndex) || 1,
      };
      if (editing) {
        const { error } = await supabase.from("modules").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("modules").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Módulo atualizado." : "Módulo cadastrado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const toggleStatus = useMutation({
    mutationFn: async (item: Module) => {
      const { error } = await supabase
        .from("modules")
        .update({ status: item.status === "active" ? "inactive" : "active" })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setEditing(null);
    setName("");
    setCourseId(filterCourse !== "all" ? filterCourse : "");
    setOrderIndex("1");
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: Module) {
    setEditing(item);
    setName(item.name);
    setCourseId(item.course_id);
    setOrderIndex(String(item.order_index));
    setErrors({});
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe o nome do módulo.";
    if (!courseId) next.courseId = "Selecione o curso.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  const noCourses = !courses.isLoading && (courses.data?.length ?? 0) === 0;

  return (
    <>
      <PageHeader
        title="Módulos"
        description="Organize os módulos de cada curso e a ordem em que são cursados."
        action={
          <Button onClick={openNew} disabled={noCourses}>
            <Plus className="size-4" /> Novo módulo
          </Button>
        }
      />

      {noCourses ? (
        <EmptyState
          icon={Layers}
          title="Cadastre um curso primeiro"
          description="Os módulos pertencem a um curso. Cadastre um curso para continuar."
        />
      ) : (
        <>
          <div className="mb-4 w-full max-w-xs">
            <Label className="mb-1.5 block text-xs text-muted-foreground">Filtrar por curso</Label>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.data?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {modules.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (modules.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Layers}
              title="Nenhum módulo cadastrado ainda"
              description="Cadastre os módulos que compõem o curso selecionado."
              action={<Button onClick={openNew}>Cadastrar módulo</Button>}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Ordem</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.data?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.order_index}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {courseName(item.course_id)}
                      </TableCell>
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
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar módulo" : "Novo módulo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="module-name">Nome do módulo</Label>
              <Input id="module-name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.data?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId ? <p className="text-xs text-destructive">{errors.courseId}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="module-order">Ordem</Label>
              <Input
                id="module-order"
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
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
