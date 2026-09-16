import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type TeacherClass = {
  id: string;
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status: string;
  course_id: string;
};

export function useTeacherRecord() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["teacher-record", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, email, status")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useTeacherClasses(teacherId: string | undefined) {
  return useQuery({
    queryKey: ["teacher-classes", teacherId],
    enabled: Boolean(teacherId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, day_of_week, start_time, end_time, status, course_id")
        .eq("teacher_id", teacherId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as TeacherClass[];
    },
  });
}
