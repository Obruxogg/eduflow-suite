# EduFlow Suite

Crie do zero a primeira versão estrutural e funcional do Sistema de Provas Digitais e Avaliação de Desempenho com backend Lovable Cloud.

Requisitos fundamentais:
1. Backend & Banco de Dados (Lovable Cloud / Supabase):
   - Tabelas:
     - `profiles` (id references auth.users on delete cascade, full_name, created_at, updated_at)
     - `user_roles` (id uuid default gen_random_uuid(), user_id references auth.users on delete cascade, role text check in ('admin', 'professor'), created_at)
     - `teachers` (id uuid default gen_random_uuid(), user_id references auth.users on delete cascade nullable, name text not null, email text not null unique, status text default 'active', created_at, updated_at)
     - `courses` (id uuid default gen_random_uuid(), name text not null, status text default 'active', created_at, updated_at)
     - `modules` (id uuid default gen_random_uuid(), course_id references courses(id) on delete cascade, name text not null, order_index int default 1, status text default 'active', created_at, updated_at)
     - `classes` (id uuid default gen_random_uuid(), course_id references courses(id) on delete cascade, name text not null, day_of_week text not null, start_time time not null, end_time time not null, teacher_id references teachers(id) on delete set null, status text default 'active', created_at, updated_at)
     - `students` (id uuid default gen_random_uuid(), full_name text not null, cpf text not null unique, status text default 'active', created_at, updated_at)
     - `enrollments` (id uuid default gen_random_uuid(), student_id references students(id) on delete cascade, class_id references classes(id) on delete cascade, current_module_id references modules(id) on delete set null, status text default 'active', created_at, updated_at)
     - Estrutura base de avaliações (fase preparatória):
       - `assessments` (id uuid, title, description, course_id, module_id, teacher_id, max_score, passing_score, status, available_from, available_until, time_limit_minutes, created_at, updated_at)
       - `questions` (id uuid, assessment_id, question_type, statement, points, order_index, grading_mode, created_at, updated_at)
       - `question_options` (id uuid, question_id, option_text, is_correct, order_index)
       - `attempts` (id uuid, assessment_id, student_id, status, started_at, submitted_at, score, percentage, created_at, updated_at)
       - `answers` (id uuid, attempt_id, question_id, selected_option_id, text_answer, awarded_points, is_correct, created_at, updated_at)
   - Ativar RLS em todas as tabelas com políticas restritivas por role (admin tem acesso gerencial total; professor acessa suas turmas/perfil; alunos/tentativas protegidos). Criar função security definer para verificação de roles (`has_role(user_id, role)`).
   - Função RPC segura para verificar se já existe algum admin cadastrado (count admins = 0) e criar o primeiro admin com signup + profile + role 'admin', bloqueando chamadas subsequentes caso já exista admin.

2. Autenticação & Fluxos:
   - Rota `/setup`: Verifica via backend se contagem de administradores == 0. Se 0, exibe formulário de cadastro do primeiro administrador (Nome, Email, Senha, Confirmação). Se já existir admin, bloqueia a criação e informa que a configuração inicial foi concluída.
   - Rota `/login`: Email e Senha. Após autenticação bem-sucedida, resolve a role do usuário e redireciona (admin -> `/admin`, professor -> `/professor`).
   - AuthContext robusto com `authLoading`, persistência de sessão (F5 não desloga), tratamento para usuário sem role configurada (sem loop).
   - Protected Routes reais: `/admin/*` restrito estritamente a administradores; `/professor/*` restrito a professores (e administradores). Se professor tentar acessar `/admin`, bloqueia com aviso de permissão ou redireciona.

3. Painel Administrativo (`/admin`):
   - Layout profissional com Sidebar e Header.
   - Dashboard com cards métricos reais (Professores ativos, Alunos cadastrados, Turmas, Cursos) mostrando 0 ou estado vazio quando sem registros (sem mock data!).
   - CRUDs funcionais completos:
     - Professores: listar, cadastrar novo professor (com criação de usuário ou geração de credencial/ativação segura), ativar/inativar.
     - Cursos: listar, cadastrar, editar, ativar/inativar.
     - Módulos: listar por curso, cadastrar, editar, ativar/inativar.
     - Turmas: listar, cadastrar vinculando curso e professor, editar, status.
     - Alunos: listar, cadastrar com validação e máscara de CPF (sem expor CPF em rotas), ativar/inativar.
     - Matrículas: vincular alunos a turmas e módulos.
   - Itens do menu não implementados com tela de status claro sem quebrar.

4. Painel do Professor (`/professor`):
   - Layout com Sidebar (Dashboard, Minhas Turmas, Avaliações, Correções, Resultados, Meu Perfil).
   - Visão geral com cards zerados/estados vazios claros ("Nenhuma avaliação cadastrada ainda", etc.).
   - Visualização das turmas atribuídas ao professor logado.

5. Design e Usabilidade:
   - Interface limpa, profissional, moderna no padrão educacional.
   - Tratamento amigável de erros (sem expor mensagens brutas de SQL/banco).
   - Validações de formulário consistentes com feedback claro.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/23f2fc17-1480-4220-a13c-7eaf48dc591d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
