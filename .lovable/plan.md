# Sistema de Provas Digitais — primeira versão

Plataforma educacional com backend próprio (Lovable Cloud), acesso por perfil
(administrador e professor) e cadastros completos para começar a operar.

## O que será entregue

### 1. Backend e banco de dados
Ativação do Lovable Cloud e criação das tabelas:

- Pessoas e acessos: perfis, papéis (admin/professor), professores
- Estrutura acadêmica: cursos, módulos, turmas, alunos, matrículas
- Base de avaliações (preparatória): avaliações, questões, alternativas,
  tentativas e respostas

Segurança:
- Proteção por linha (RLS) ativada em todas as tabelas
- Função segura `has_role(user_id, role)` para checagem de papel, evitando
  recursão nas políticas
- Admin: acesso gerencial total. Professor: leitura da estrutura acadêmica,
  suas turmas e seu próprio perfil. Alunos, tentativas e respostas protegidos
- Função segura para o cadastro inicial: informa se já existe algum admin e
  permite criar o primeiro; chamadas seguintes são bloqueadas

### 2. Autenticação e acesso
- `/setup`: se ainda não houver administrador, formulário de criação do
  primeiro admin (nome, e-mail, senha, confirmação). Se já existir, mostra
  aviso de configuração concluída e link para entrar
- `/login`: e-mail e senha; após entrar, o sistema identifica o papel e leva
  para `/admin` ou `/professor`
- Sessão persistente (atualizar a página não desconecta), estado de
  carregamento e mensagem clara quando a conta não tiver papel definido
- Áreas protegidas de verdade: `/admin` só para administradores;
  `/professor` para professores e administradores. Acesso indevido mostra
  aviso de permissão em vez de tela quebrada

### 3. Painel do administrador
- Layout com menu lateral e cabeçalho
- Painel inicial com números reais: professores ativos, alunos, turmas,
  cursos — exibindo zero/estado vazio quando não há registros
- Cadastros completos:
  - Professores: listar, cadastrar (com criação do acesso), ativar/inativar
  - Cursos: listar, cadastrar, editar, ativar/inativar
  - Módulos: por curso, com ordem, cadastrar, editar, ativar/inativar
  - Turmas: curso, professor, dia da semana, horários, status
  - Alunos: cadastro com máscara e validação de CPF, ativar/inativar
  - Matrículas: vincular aluno a turma e módulo atual
- Itens de menu ainda não implementados abrem uma tela "em preparação"

### 4. Painel do professor
- Menu lateral: Painel, Minhas Turmas, Avaliações, Correções, Resultados,
  Meu Perfil
- Visão geral com indicadores e mensagens de estado vazio claras
- Lista das turmas atribuídas ao professor conectado

### 5. Design e usabilidade
- Identidade visual educacional: azul profundo institucional, apoio em verde-
  ensino, tipografia limpa, cartões com respiro e tabelas legíveis
- Mensagens de erro amigáveis, nunca texto técnico do banco
- Validação de formulários com feedback campo a campo

## Notas técnicas

- TanStack Start + Lovable Cloud; leitura/escrita via server functions com
  `requireSupabaseAuth`, RLS aplicada como o usuário
- CPF nunca aparece em URLs; listagens usam identificadores internos
- Criação de professor e do primeiro admin via função de banco/servidor com
  privilégio controlado, após verificação de papel
- Sem dados fictícios em nenhuma tela

## Fora do escopo desta versão

Montagem e aplicação de provas, correção e relatórios de desempenho — as
tabelas ficam prontas, as telas entram na fase seguinte.
