import { CATEGORIES, type CategoryConfig } from "./categories";
import type { Certificate } from "./types";

export type CategoryProgress = CategoryConfig & {
  approvedHours: number;
  pendingHours: number;
  /** Horas ainda necessárias para bater a meta (não conta as pendentes). */
  remainingHours: number;
  /** Horas já ocupadas na categoria (aprovadas + pendentes). */
  committedHours: number;
  /** Quanto ainda cabe na categoria antes de ultrapassar o limite. */
  availableHours: number;
  /** Percentual da meta já aprovado (0–100). */
  percentApproved: number;
};

function sumHours(certificates: Certificate[]) {
  return certificates.reduce((total, cert) => total + cert.hours, 0);
}

export function getCategoryProgress(certificates: Certificate[]): CategoryProgress[] {
  return CATEGORIES.map((config) => {
    const inCategory = certificates.filter((cert) => cert.category === config.key);
    const approvedHours = sumHours(inCategory.filter((cert) => cert.status === "aprovado"));
    const pendingHours = sumHours(inCategory.filter((cert) => cert.status === "pendente"));
    const remainingHours = Math.max(config.requiredHours - approvedHours, 0);
    const committedHours = approvedHours + pendingHours;
    const availableHours = Math.max(config.requiredHours - committedHours, 0);
    const percentApproved = Math.min(
      Math.round((approvedHours / config.requiredHours) * 100),
      100,
    );

    return {
      ...config,
      approvedHours,
      pendingHours,
      remainingHours,
      committedHours,
      availableHours,
      percentApproved,
    };
  });
}

export function getTotals(progress: CategoryProgress[]) {
  return progress.reduce(
    (totals, category) => ({
      approvedHours: totals.approvedHours + category.approvedHours,
      pendingHours: totals.pendingHours + category.pendingHours,
      requiredHours: totals.requiredHours + category.requiredHours,
      remainingHours: totals.remainingHours + category.remainingHours,
    }),
    { approvedHours: 0, pendingHours: 0, requiredHours: 0, remainingHours: 0 },
  );
}
