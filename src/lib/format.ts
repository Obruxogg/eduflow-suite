export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split("").map(Number) as number[];
  for (const length of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += (digits[i] as number) * (length + 1 - i);
    const remainder = (sum * 10) % 11 % 10;
    if (remainder !== digits[length]) return false;
  }
  return true;
}

const WEEKDAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

export const weekdays = WEEKDAYS;

export function friendlyError(error: unknown, fallback = "Não foi possível concluir a ação."): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const text = raw.toLowerCase();
  if (!raw) return fallback;
  if (text.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (text.includes("email not confirmed")) return "Este e-mail ainda não foi confirmado.";
  if (text.includes("duplicate key") || text.includes("unique")) return "Já existe um registro com estes dados.";
  if (text.includes("row-level security") || text.includes("permission"))
    return "Você não tem permissão para esta ação.";
  if (text.includes("foreign key")) return "Este registro está vinculado a outros cadastros.";
  if (/(select|insert|update|delete|constraint|pgrst|sqlstate|relation)/.test(text)) return fallback;
  return raw.length > 160 ? fallback : raw;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.slice(0, 5);
}
