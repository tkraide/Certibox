export type UserRole = "aluno" | "professor";

export function resolveRoleFromEmail(email: string): UserRole {
  if (email.endsWith("@estudante.ufscar.br")) return "aluno";
  if (email.endsWith("@ufscar.br")) return "professor";
  return "aluno"; // fallback
}
