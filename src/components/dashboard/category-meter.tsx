"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock, Hourglass } from "lucide-react";

import type { CategoryProgress } from "@/lib/hours/aggregate";

type CategoryMeterProps = {
  progress: CategoryProgress;
};

/**
 * Trilha e preenchimento vêm da MESMA rampa de cor (laranja), variando só a
 * luminosidade — como pede o design system do CertiBox (laranja + neutros,
 * sem introduzir verde/vermelho de "status genérico"). A diferenciação real
 * entre aprovadas/pendentes não depende da cor: tem ícone + texto na legenda
 * abaixo do gráfico e no tooltip.
 */
const RAMP = {
  light: {
    aprovadas: "#ff6c29", // primary-500
    pendentes: "#ffc9ad", // primary-200
    restante: "#f5f5f5", // neutral-100
    gap: "#ffffff",
  },
  dark: {
    aprovadas: "#ff8748", // primary-400 (~7–8:1 sobre neutral-950)
    pendentes: "#9a3412", // primary-800
    restante: "#262626", // neutral-800
    gap: "#0a0a0a",
  },
};

type TooltipPayloadRow = {
  name: string;
  aprovadas: number;
  pendentes: number;
  restante: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TooltipPayloadRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.name}</p>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">Aprovadas: {row.aprovadas}h</p>
      <p className="text-neutral-600 dark:text-neutral-400">Pendentes: {row.pendentes}h</p>
      <p className="text-neutral-600 dark:text-neutral-400">Disponível na categoria: {row.restante}h</p>
    </div>
  );
}

export function CategoryMeter({ progress }: CategoryMeterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita divergência de hidratação: o tema só é conhecido no cliente.
  useEffect(() => setMounted(true), []);

  const colors = mounted && resolvedTheme === "dark" ? RAMP.dark : RAMP.light;

  // "restante" aqui é a VAGA que ainda cabe na categoria (availableHours =
  // requiredHours - aprovadas - pendentes), não o "Restantes" da legenda
  // abaixo (remainingHours = requiredHours - aprovadas, ignorando as
  // pendentes de propósito). São métricas diferentes: a barra soma sempre
  // aprovadas + pendentes + disponível = requiredHours (por isso usa
  // availableHours) — usar remainingHours aqui faria a soma ultrapassar o
  // domínio do eixo (0..requiredHours) sempre que houver horas pendentes.
  const data: TooltipPayloadRow[] = [
    {
      name: progress.label,
      aprovadas: progress.approvedHours,
      pendentes: progress.pendingHours,
      restante: progress.availableHours,
    },
  ];

  // O segmento mais à direita (o único com "ponta livre") recebe o
  // arredondamento; o início da barra (baseline) fica sempre reto.
  const lastSegment: keyof TooltipPayloadRow =
    progress.availableHours > 0
      ? "restante"
      : progress.pendingHours > 0
        ? "pendentes"
        : "aprovadas";

  return (
    <article className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {progress.label}
          </h3>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {progress.approvedHours}h{" "}
            <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
              de {progress.requiredHours}h
            </span>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
          {progress.percentApproved}%
        </span>
      </div>

      <div
        className="mt-4 h-6 w-full"
        role="img"
        aria-label={`Progresso em ${progress.label}: ${progress.approvedHours} horas aprovadas, ${progress.pendingHours} horas pendentes, ${progress.availableHours} horas ainda disponíveis, de ${progress.requiredHours} horas necessárias no total`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barSize={20}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis type="number" domain={[0, progress.requiredHours]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="aprovadas"
              stackId="progresso"
              fill={colors.aprovadas}
              stroke={colors.gap}
              strokeWidth={2}
              radius={lastSegment === "aprovadas" ? [0, 4, 4, 0] : undefined}
              isAnimationActive={false}
            />
            <Bar
              dataKey="pendentes"
              stackId="progresso"
              fill={colors.pendentes}
              stroke={colors.gap}
              strokeWidth={2}
              radius={lastSegment === "pendentes" ? [0, 4, 4, 0] : undefined}
              isAnimationActive={false}
            />
            <Bar
              dataKey="restante"
              stackId="progresso"
              fill={colors.restante}
              stroke={colors.gap}
              strokeWidth={2}
              radius={lastSegment === "restante" ? [0, 4, 4, 0] : undefined}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <li className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
          <CheckCircle2
            className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <span>
            Aprovadas: <strong className="font-semibold">{progress.approvedHours}h</strong>
          </span>
        </li>
        <li className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
          <Clock className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
          <span>
            Pendentes: <strong className="font-semibold">{progress.pendingHours}h</strong>
          </span>
        </li>
        <li className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
          <Hourglass
            className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
          <span>
            Restantes: <strong className="font-semibold">{progress.remainingHours}h</strong>
          </span>
        </li>
      </ul>
    </article>
  );
}
