
-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','professor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- TEACHERS
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers admin manage" ON public.teachers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "teacher reads own" ON public.teachers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses admin manage" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "courses staff read" ON public.courses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'professor'));

-- MODULES
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules admin manage" ON public.modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "modules staff read" ON public.modules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'professor'));

-- CLASSES
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes admin manage" ON public.classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "classes teacher read own" ON public.classes FOR SELECT TO authenticated
  USING (teacher_id = public.current_teacher_id());

-- STUDENTS
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students admin manage" ON public.students FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ENROLLMENTS
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  current_module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments admin manage" ON public.enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "enrollments teacher read" ON public.enrollments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = public.current_teacher_id()));
CREATE POLICY "students teacher read" ON public.students FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.enrollments e JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = students.id AND c.teacher_id = public.current_teacher_id()));

-- ASSESSMENTS
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  max_score NUMERIC NOT NULL DEFAULT 10,
  passing_score NUMERIC NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'draft',
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  time_limit_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments admin manage" ON public.assessments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "assessments teacher manage own" ON public.assessments FOR ALL TO authenticated
  USING (teacher_id = public.current_teacher_id()) WITH CHECK (teacher_id = public.current_teacher_id());

-- QUESTIONS
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  statement TEXT NOT NULL,
  points NUMERIC NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 1,
  grading_mode TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions admin manage" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "questions teacher manage own" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = public.current_teacher_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = public.current_teacher_id()));

-- QUESTION OPTIONS
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_options TO authenticated;
GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options admin manage" ON public.question_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "options teacher manage own" ON public.question_options FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.questions q JOIN public.assessments a ON a.id = q.assessment_id
                 WHERE q.id = question_id AND a.teacher_id = public.current_teacher_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.questions q JOIN public.assessments a ON a.id = q.assessment_id
                 WHERE q.id = question_id AND a.teacher_id = public.current_teacher_id()));

-- ATTEMPTS
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  percentage NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts admin manage" ON public.attempts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "attempts teacher manage own" ON public.attempts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = public.current_teacher_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = public.current_teacher_id()));

-- ANSWERS
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  text_answer TEXT,
  awarded_points NUMERIC,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers admin manage" ON public.answers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "answers teacher manage own" ON public.answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts t JOIN public.assessments a ON a.id = t.assessment_id
                 WHERE t.id = attempt_id AND a.teacher_id = public.current_teacher_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts t JOIN public.assessments a ON a.id = t.assessment_id
                 WHERE t.id = attempt_id AND a.teacher_id = public.current_teacher_id()));

-- updated_at triggers
CREATE TRIGGER t_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_teachers BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_courses BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_modules BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_classes BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_enrollments BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_assessments BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_questions BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_attempts BEFORE UPDATE ON public.attempts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_answers BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
