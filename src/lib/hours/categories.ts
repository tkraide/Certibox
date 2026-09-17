export type CategoryKey = "complementares" | "extensao";

export type CategoryConfig = {
  key: CategoryKey;
  label: string;
  requiredHours: number;
  /** Tipos de atividade sugeridos para preencher a categoria (usado nos insights). */
  suggestions: string[];
};

export const CATEGORIES: CategoryConfig[] = [
  {
    key: "complementares",
    label: "Atividades Complementares",
    requiredHours: 90,
    suggestions: ["minicursos", "monitorias", "participação em eventos", "iniciação científica"],
  },
  {
    key: "extensao",
    label: "Atividades de Extensão",
    requiredHours: 330,
    suggestions: ["projetos de extensão", "cursos de ACIEPEs"],
  },
];

export function getCategoryConfig(key: CategoryKey): CategoryConfig {
  const config = CATEGORIES.find((category) => category.key === key);
  if (!config) {
    throw new Error(`Categoria desconhecida: ${key}`);
  }
  return config;
}
