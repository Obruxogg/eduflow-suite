import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const bootstrapSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
});

const teacherSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
});

/** Public: tells the setup screen whether the first administrator already exists. */
export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("admin_exists");
  if (error) throw new Error("Não foi possível verificar a configuração inicial.");
  return { adminExists: Boolean(data) };
});

/** Public, but self-locking: only works while no administrator exists. */
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bootstrapSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: exists, error: checkError } = await supabaseAdmin.rpc("admin_exists");
    if (checkError) throw new Error("Não foi possível verificar a configuração inicial.");
    if (exists) {
      return { ok: false as const, message: "A configuração inicial já foi concluída." };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (createError || !created.user) {
      console.error("bootstrapFirstAdmin createUser failed", createError);
      return {
        ok: false as const,
        message: "Não foi possível criar o administrador. Verifique se o e-mail já está em uso.",
      };
    }

    const userId = created.user.id;
    await supabaseAdmin.from("profiles").insert({ id: userId, full_name: data.fullName });
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { ok: false as const, message: "Não foi possível concluir a configuração inicial." };
    }

    return { ok: true as const, message: "Administrador criado com sucesso." };
  });

/** Admin only: creates a teacher together with their sign-in credentials. */
export const createTeacherWithAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => teacherSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Você não tem permissão para esta ação.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, message: "Já existe um professor com este e-mail." };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });
    if (createError || !created.user) {
      return {
        ok: false as const,
        message: "Não foi possível criar o acesso. Verifique se o e-mail já está em uso.",
      };
    }

    const userId = created.user.id;
    await supabaseAdmin.from("profiles").insert({ id: userId, full_name: data.name });
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "professor" });
    const { error: teacherError } = await supabaseAdmin.from("teachers").insert({
      user_id: userId,
      name: data.name,
      email: data.email,
      status: "active",
    });
    if (teacherError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { ok: false as const, message: "Não foi possível cadastrar o professor." };
    }

    return { ok: true as const, message: "Professor cadastrado com sucesso." };
  });
