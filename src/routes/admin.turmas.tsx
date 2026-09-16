import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus } from "lucide-react";
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
import { formatTime, friendlyError, weekdays } from "@/lib/format";

export const Route = createFileRoute("/admin/turmas")({
  component: ClassesPage,
});

type Option = { id: string; name: string };
type ClassRow = {
  id: string;
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status: string;
  course_id: string;
  teacher_id: string | null;
};
type Errors = Partial<Record<"name" | "courseId" | "day" | "time", string>>;

const NO_TEACHER = "none";

function ClassesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState<string>(NO_TEACHER);
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("22:00");
  const [errors, setErrors] = useState<Errors>({});

  const courses = useQuery({
    queryKey: ["courses-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name").order("name");
      if (error) throw error;
      return (data ?? []) as Option[];
    },
  });

  const teachers = useQuery({
    queryKey: ["teachers-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Option[];
    },
  });

  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, day_of_week, start_time, end_time, status, course_id, teacher_id")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
  });

  const courseName = (id: string) => courses.data?.find((c) => c.id === id)?.name ?? "—";
  const teacherName = (id: string | null) =>
    id ? (teachers.data?.find((t) => t.id === id)?.name ?? "—") : "Sem professor";

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        course_id: courseId,
        teacher_id: teacherId === NO_TEACHER ? null : teacherId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
      };
      if (editing) {
        const { error } = await supabase.from("classes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Turma atualizada." : "Turma cadastrada.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const toggleStatus = useMutation({
    mutationFn: async (item: ClassRow) => {
      const { error } = await supabase
        .from("classes")
        .update({ status: item.status === "active" ? "inactive" : "active" })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Situação atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  function openNew() {
    setEditing(null);
    setName("");
    setCourseId("");
    setTeacherId(NO_TEACHER);
    setDay("");
    setStartTime("19:00");
    setEndTime("22:00");
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: ClassRow) {
    setEditing(item);
    setName(item.name);
    setCourseId(item.course_id);
    setTeacherId(item.teacher_id ?? NO_TEACHER);
    setDay(item.day_of_week);
    setStartTime(item.start_time.slice(0, 5));
    setEndTime(item.end_time.slice(0, 5));
    setErrors({});
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe o nome da turma.";
    if (!courseId) next.courseId = "Selecione o curso.";
    if (!day) next.day = "Selecione o dia da semana.";
    if (!startTime || !endTime || endTime <= startTime)
      next.time = "O horário final deve ser maior que o inicial.";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  const noCourses = !courses.isLoading && (courses.data?.length ?? 0) === 0;

  return (
    <>
      <PageHeader
        title="Turmas"
        description="Defina turmas com curso, professor responsável e horários."
        action={
          <Button onClick={openNew} disabled={noCourses}>
            <Plus className="size-4" /> Nova turma
          </Button>
        }
      />

      {noCourses ? (
        <EmptyState
          icon={GraduationCap}
          title="Cadastre um curso primeiro"
          description="Toda turma pertence a um curso."
        />
      ) : classes.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (classes.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma cadastrada ainda"
          description="Crie a primeira turma para começar a matricular alunos."
          action={<Button onClick={openNew}>Cadastrar turma</Button>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Encontro</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{courseName(item.course_id)}</TableCell>
                  <TableCell className="text-muted-foreground">{teacherName(item.teacher_id)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.day_of_week} · {formatTime(item.start_time)}–{formatTime(item.end_time)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar turma" : "Nova turma"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="class-name">Nome da turma</Label>
              <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} />
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
              <Label>Professor</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TEACHER}>Sem professor</SelectItem>
                  {teachers.data?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((weekday) => (
                    <SelectItem key={weekday} value={weekday}>
                      {weekday}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.day ? <p className="text-xs text-destructive">{errors.day}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-time">Início</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time">Término</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {errors.time ? <p className="text-xs text-destructive">{errors.time}</p> : null}
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
